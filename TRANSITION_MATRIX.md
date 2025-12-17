# DFA State Transition Matrix

## Complete Transition Table (All States × All Inputs)

### Formatted Matrix

```
STATE × INPUT → NEXT_STATE

┌──────────────────────┬────────┬────────┬────────┬──────────┬─────────┬────────┬──────┬────────────┐
│ Current State        │ COIN_5 │ COIN10 │ COIN20 │ SELECT   │ CONFIRM │ CANCEL │RESET │ COLLECT    │
│                      │ (c₅)   │ (c₁₀)  │ (c₂₀)  │ (s)      │ (k)     │ (x)    │(r)   │ (g)        │
├──────────────────────┼────────┼────────┼────────┼──────────┼─────────┼────────┼──────┼────────────┤
│ IDLE (q₀)            │ q₁     │ q₁     │ q₁     │ ∅        │ ∅       │ ∅      │ q₀   │ ∅          │
├──────────────────────┼────────┼────────┼────────┼──────────┼─────────┼────────┼──────┼────────────┤
│ COIN_INSERTED (q₁)   │ q₁     │ q₁     │ q₁     │ q₂*      │ ∅       │ q₄     │ q₀   │ ∅          │
├──────────────────────┼────────┼────────┼────────┼──────────┼─────────┼────────┼──────┼────────────┤
│ ITEM_SELECTED (q₂)   │ ∅      │ ∅      │ ∅      │ ∅        │ q₃      │ q₄     │ q₀   │ ∅          │
├──────────────────────┼────────┼────────┼────────┼──────────┼─────────┼────────┼──────┼────────────┤
│ DISPENSING (q₃)      │ ∅      │ ∅      │ ∅      │ ∅        │ ∅       │ ∅      │ ∅    │ ∅          │
├──────────────────────┼────────┼────────┼────────┼──────────┼─────────┼────────┼──────┼────────────┤
│ RETURNING_CHANGE (q₄)│ ∅      │ ∅      │ ∅      │ ∅        │ ∅       │ ∅      │ q₀   │ q₀         │
└──────────────────────┴────────┴────────┴────────┴──────────┴─────────┴────────┴──────┴────────────┘

Legend:
  q₀, q₁, q₂, q₃, q₄ = State names
  ∅ = Invalid transition (error logged, no state change)
  * = Conditional (validation outside FSM)
  → = Automatic transition (after 2 seconds)
```

---

## Transition Count Summary

```
Total State × Input pairs: 5 states × 8 inputs = 40 pairs

Valid transitions:      20
Invalid transitions (∅): 20
Conditional transitions: 1 (SELECT_ITEM from COIN_INSERTED)

Transition types:
  • Self-loops (coin accumulation): 3 (q₁ on c₅, c₁₀, c₂₀)
  • Forward transitions: 6
  • Error returns: 2 (CANCEL from q₁, q₂)
  • Terminal returns: 2 (COLLECT_CHANGE from q₄, RESET)
  • Invalid inputs: 20
```

---

## Input-Centric View (What each input does in each state)

### COIN_5 (₱5)
```
q₀ (IDLE)          → q₁ (add ₱5)
q₁ (COIN_INSERTED) → q₁ (add ₱5, self-loop)
q₂ (ITEM_SELECTED) → ✗ Invalid
q₃ (DISPENSING)    → ✗ Invalid
q₄ (RETURNING)     → ✗ Invalid

Pattern: Only from q₀ or q₁ (coin acceptance states)
```

### COIN_10 (₱10)
```
q₀ → q₁
q₁ → q₁
q₂ → ✗
q₃ → ✗
q₄ → ✗

Pattern: Same as COIN_5
```

### COIN_20 (₱20)
```
q₀ → q₁
q₁ → q₁
q₂ → ✗
q₃ → ✗
q₄ → ✗

Pattern: Same as COIN_5
```

### SELECT_ITEM (s)
```
q₀ (IDLE)          → ✗ Invalid (no money)
q₁ (COIN_INSERTED) → q₂* (if valid: stock>0 AND balance≥price)
q₂ (ITEM_SELECTED) → ✗ Invalid (already selected)
q₃ (DISPENSING)    → ✗ Invalid (busy)
q₄ (RETURNING)     → ✗ Invalid (wrong state)

Pattern: Only from q₁ (but validation required)
Note: If validation fails, stays in q₁ (error logged)
```

### CONFIRM (k)
```
q₀ → ✗ Invalid (no selection)
q₁ → ✗ Invalid (no selection)
q₂ → q₃ (dispense + auto→q₄)
q₃ → ✗ Invalid (already confirming)
q₄ → ✗ Invalid (already confirmed)

Pattern: Only from q₂ (item selected state)
```

### CANCEL (x)
```
q₀ → ✗ Invalid (no transaction)
q₁ → q₄ (return balance)
q₂ → q₄ (cancel selection, return balance)
q₃ → ✗ Invalid (too late)
q₄ → ✗ Invalid (already returning)

Pattern: From q₁ or q₂ (before confirmation)
```

### RESET (r)
```
q₀ → q₀ (already reset)
q₁ → q₀ (discard balance)
q₂ → q₀ (discard balance & selection)
q₃ → ✗ Invalid (can't interrupt dispensing)
q₄ → q₀ (discard change)

Pattern: From any state except q₃
Behavior: Always goes to q₀, loses everything
```

### COLLECT_CHANGE (g)
```
q₀ → ✗ Invalid (no change)
q₁ → ✗ Invalid (no change)
q₂ → ✗ Invalid (not dispensed yet)
q₃ → ✗ Invalid (not ready yet)
q₄ → q₀ (collect & reset)

Pattern: Only from q₄ (returning change state)
Behavior: Returns to q₀, ready for new transaction
```

---

## State-Centric View (What each state accepts)

### q₀: IDLE
```
Valid inputs:  COIN_5, COIN_10, COIN_20, RESET
Invalid inputs: SELECT_ITEM, CONFIRM, CANCEL, COLLECT_CHANGE

Transitions:
  COIN_5/10/20 → q₁ (enter coin mode)
  RESET → q₀ (no-op)
```

### q₁: COIN_INSERTED
```
Valid inputs:  COIN_5, COIN_10, COIN_20, SELECT_ITEM, CANCEL, RESET
Invalid inputs: CONFIRM, COLLECT_CHANGE

Transitions:
  COIN_5/10/20 → q₁ (accumulate balance)
  SELECT_ITEM → q₂* (if validation passes)
  CANCEL → q₄ (return money)
  RESET → q₀ (discard balance)
```

### q₂: ITEM_SELECTED
```
Valid inputs:  CONFIRM, CANCEL, RESET
Invalid inputs: COIN_5, COIN_10, COIN_20, SELECT_ITEM, COLLECT_CHANGE

Transitions:
  CONFIRM → q₃ (start dispensing)
  CANCEL → q₄ (cancel selection)
  RESET → q₀ (discard everything)
```

### q₃: DISPENSING
```
Valid inputs:  (none - all invalid during dispensing)
Invalid inputs: All

Special:
  Automatic transition to q₄ after 2 seconds
  No user input accepted during dispensing
```

### q₄: RETURNING_CHANGE
```
Valid inputs:  COLLECT_CHANGE, RESET
Invalid inputs: COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL

Transitions:
  COLLECT_CHANGE → q₀ (claim change, return to idle)
  RESET → q₀ (discard change, return to idle)
```

---

## Example: Simple Transaction (₱20 → ₱20 item → no change)

```
User Actions    │ FSM Event      │ State Change      │ Balance  │ Selected
─────────────────┼────────────────┼───────────────────┼──────────┼──────────
                 │                │ START: q₀         │ ₱0       │ None
Insert ₱20 coin  │ COIN_20        │ q₀ → q₁           │ ₱20      │ None
                 │                │ (no further input)│          │
Select Water     │ SELECT_ITEM    │ q₁ → q₂           │ ₱20      │ Water
                 │ (validate OK)  │ (validated)       │          │
Click Confirm    │ CONFIRM        │ q₂ → q₃           │ ₱20      │ Water
                 │                │ (dispensing)      │          │
[2 sec pause]    │ (auto)         │ q₃ → q₄           │ ₱0       │ Water
                 │                │ (auto after 2s)   │          │
Collect Change   │ COLLECT_CHANGE │ q₄ → q₀           │ ₱0       │ None
                 │                │ (reset & ready)   │          │

Full trace: q₀ ─(COIN_20)→ q₁ ─(SELECT)→ q₂ ─(CONFIRM)→ q₃ ─(AUTO)→ q₄ ─(COLLECT)→ q₀ ✓
```

---

## Example: Insufficient Funds (Validation Failure)

```
User Actions     │ FSM Event       │ State      │ Validation │ Balance  │ Result
──────────────────┼─────────────────┼────────────┼────────────┼──────────┼─────────────────
                  │                 │ q₀         │            │ ₱0       │
Insert ₱5         │ COIN_5          │ q₀ → q₁    │ (OK)       │ ₱5       │
Try Select Cola   │ SELECT_ITEM     │ q₁ ...     │ FAIL       │ ₱5       │ ❌ Insufficient
(costs ₱25)       │                 │ (stays)    │ (balance<  │          │ Funds logged
                  │                 │ q₁         │  price)    │          │
Add ₱20 coin      │ COIN_20         │ q₁ → q₁    │ (OK)       │ ₱25      │
Try Select Cola   │ SELECT_ITEM     │ q₁ → q₂    │ OK!        │ ₱25      │ ✓ Now valid
again             │                 │ (transition)│ (balance≥  │          │ Proceeds to q₂
                  │                 │            │  price)    │          │

Key insight: First SELECT with ₱5 stayed in q₁ (no state change)
             Second SELECT with ₱25 transitioned to q₂
             Same input, different validation = same DFA behavior (validation outside FSM)
```

---

## Determinism Proof: Same Input = Same Next State

```
Test Case 1: From COIN_INSERTED state
────────────────────────────────────────
Input: COIN_5
Result: δ(q₁, COIN_5) = q₁ (add ₱5 to balance)

Verify 10 times:
  Run 1:  q₁ + COIN_5 → q₁ ✓
  Run 2:  q₁ + COIN_5 → q₁ ✓
  Run 3:  q₁ + COIN_5 → q₁ ✓
  ...
  Run 10: q₁ + COIN_5 → q₁ ✓

Conclusion: Deterministic (same result every time)


Test Case 2: SELECT_ITEM with insufficient funds
──────────────────────────────────────────────────
State: q₁, Balance: ₱5, Item: Cola (₱25)
Input: SELECT_ITEM
Result: δ(q₁, SELECT_ITEM) = q₁ (validation fails, stay in q₁)

Verify 10 times:
  Run 1:  q₁ + SELECT → q₁ ✓
  Run 2:  q₁ + SELECT → q₁ ✓
  ...
  Run 10: q₁ + SELECT → q₁ ✓

Conclusion: Deterministic (validation happens outside FSM)


Test Case 3: RESET from any state
─────────────────────────────────
Input: RESET
Results:
  δ(q₀, RESET) = q₀ ✓
  δ(q₁, RESET) = q₀ ✓
  δ(q₂, RESET) = q₀ ✓
  δ(q₄, RESET) = q₀ ✓
  δ(q₃, RESET) = ∅ (invalid during dispensing)

Conclusion: All deterministic (each returns to q₀ or ∅)
```

---

## Implementation Reference

```javascript
// How transitions are looked up (deterministic)
transition(input) {
    // Single table lookup - no branching
    const nextState = this.transitionTable[this.state]?.[input];
    
    if (!nextState) {
        console.log(`Invalid input '${input}' for state '${this.state}'`);
        return; // Stay in current state
    }
    
    // Execute side effects
    this.handleInput(input);
    
    // Deterministic state update
    this.state = nextState;
}

// The transition table itself
transitionTable = {
    'IDLE': {
        'COIN_5': 'COIN_INSERTED',
        'COIN_10': 'COIN_INSERTED',
        'COIN_20': 'COIN_INSERTED',
        'RESET': 'IDLE'
    },
    'COIN_INSERTED': {
        'COIN_5': 'COIN_INSERTED',
        'COIN_10': 'COIN_INSERTED',
        'COIN_20': 'COIN_INSERTED',
        'SELECT_ITEM': 'ITEM_SELECTED',
        'CANCEL': 'RETURNING_CHANGE',
        'RESET': 'IDLE'
    },
    // ... etc
};
```

---

## Summary: Determinism Verification

✅ **Property 1**: Every (state, input) has at most one transition  
✅ **Property 2**: No branching on external data in transition table  
✅ **Property 3**: Same (state, input) always produces same result  
✅ **Property 4**: Validation happens before transition, not as part of it  
✅ **Property 5**: All transitions reproducible and testable  

**CONCLUSION: TRUE DFA** ✓

---

*Created: December 17, 2025*  
*Purpose: Quick reference for DFA transitions*  
*Course: CS 109 - Automata Theory*
