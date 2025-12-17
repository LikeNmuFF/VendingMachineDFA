# Vending Machine - Deterministic Finite Automaton (DFA)

## Formal DFA Definition

A **Deterministic Finite Automaton** is defined as:
```
M = (Q, Σ, δ, q₀, F)
```

Where:
- **Q** = Set of states
- **Σ** = Set of input symbols
- **δ** = Transition function (Q × Σ → Q)
- **q₀** = Initial state
- **F** = Set of final/accepting states

---

## DFA Components

### States (Q)

The vending machine has **5 states**:

| State | Label | Description |
|-------|-------|-------------|
| **q₀** | IDLE | Initial state, awaiting coins |
| **q₁** | COIN_INSERTED | Money inserted, awaiting item selection |
| **q₂** | ITEM_SELECTED | Item selected with sufficient funds |
| **q₃** | DISPENSING | Currently dispensing the item |
| **q₄** | RETURNING_CHANGE | Item dispensed, returning change |

### Input Alphabet (Σ)

The input symbols are **deterministic and context-specific**:

| Symbol | Input | Cost | Description |
|--------|-------|------|-------------|
| **c₅** | COIN_5 | ₱5 | Insert ₱5 coin |
| **c₁₀** | COIN_10 | ₱10 | Insert ₱10 coin |
| **c₂₀** | COIN_20 | ₱20 | Insert ₱20 coin |
| **s** | SELECT_ITEM | - | Select an item (validated by balance & stock) |
| **k** | CONFIRM | - | Confirm purchase |
| **x** | CANCEL | - | Cancel transaction |
| **r** | RESET | - | Reset machine to IDLE |
| **g** | COLLECT_CHANGE | - | Collect change and return to IDLE |

**Σ = {c₅, c₁₀, c₂₀, s, k, x, r, g}**

### Transition Function (δ)

The deterministic transition table δ(q, σ) → q':

```
             c₅          c₁₀         c₂₀         s           k           x           r           g
q₀ (IDLE)    q₁          q₁          q₁          ∅           ∅           ∅           q₀          ∅
q₁ (COIN)    q₁          q₁          q₁          q₂*         ∅           q₄          q₀          ∅
q₂ (ITEM)    ∅           ∅           ∅           ∅           q₃          q₄          q₀          ∅
q₃ (DISP)    ∅           ∅           ∅           ∅           ∅           ∅           ∅           ∅
q₄ (CHANGE)  ∅           ∅           ∅           ∅           ∅           ∅           q₀          q₀
```

**∅** = No valid transition (invalid input for this state)  
**\*** = SELECT_ITEM transition only valid if:
- Item has stock > 0
- balance ≥ item_price

If validation fails, **no state change occurs** (remain in q₁).

### Initial State

**q₀ = IDLE**

### Accepting States

**F = {q₀}** (Only IDLE is an accepting state - machine is idle and ready)

---

## Example Execution Traces

### Trace 1: Successful Purchase

```
State sequence: q₀ → q₁ → q₂ → q₃ → q₄ → q₀

Input string: c₂₀ s k g

1. START at q₀ (IDLE)
   Input: c₂₀ (COIN_20)
   → q₁ (COIN_INSERTED), balance = ₱20

2. At q₁ (COIN_INSERTED)
   Input: s (SELECT_ITEM), select Water (₱20)
   → q₂ (ITEM_SELECTED)
   
3. At q₂ (ITEM_SELECTED)
   Input: k (CONFIRM)
   → q₃ (DISPENSING), dispense Water
   (auto-transition after 2s)
   → q₄ (RETURNING_CHANGE), change = ₱0

4. At q₄ (RETURNING_CHANGE)
   Input: g (COLLECT_CHANGE)
   → q₀ (IDLE) - ACCEPTING STATE ✓
```

### Trace 2: Insufficient Funds (No Transition)

```
Input: c₅ s (select Cola ₱25)

1. START at q₀
   Input: c₅ (COIN_5)
   → q₁, balance = ₱5

2. At q₁
   Input: s (SELECT_ITEM), try to select Cola (₱25)
   ✗ VALIDATION FAILS: balance (₱5) < price (₱25)
   → REMAIN in q₁ (no state change)
   Log: "❌ INSUFFICIENT FUNDS: Need ₱20 more for Cola"
```

### Trace 3: Out of Stock (No Transition)

```
Input: c₅ s (select Cookies - out of stock)

1. START at q₀
   Input: c₅
   → q₁

2. At q₁
   Input: s (SELECT_ITEM), try to select Cookies
   ✗ VALIDATION FAILS: stock = 0
   → REMAIN in q₁ (no state change)
   Log: "❌ Cookies is OUT OF STOCK - cannot select"
```

### Trace 4: Cancel & Reset

```
Input: c₁₀ x r

1. q₀ → c₁₀ → q₁ (balance = ₱10)

2. q₁ → x (CANCEL) → q₄ (return ₱10 change)

3. q₄ → r (RESET) → q₀ (machine reset, change cleared)
```

---

## Why This is a True DFA

### Determinism Property
For every (state, input) pair, there is **exactly ONE** next state:
- **No branching** on data conditions in the transition table
- **Data validation** (balance, stock) happens **outside** the FSM
  - If validation fails, the FSM **stays in the current state**
  - No data-dependent state choices

### Formal Properties
1. ✓ **Complete**: Defined for all states (transitions or ∅)
2. ✓ **Deterministic**: Each (q, σ) maps to at most one state
3. ✓ **Well-defined**: Clear accepting state (IDLE)
4. ✓ **Minimal states**: 5 states for the business logic

### Comparison to Original Implementation

**Before (Not a True DFA):**
```javascript
if (this.state === COIN_INSERTED && input === SELECT_ITEM) {
    if (product.stock === 0) {
        state = OUT_OF_STOCK;      // Path A (data-dependent)
    } else if (balance >= price) {
        state = ITEM_SELECTED;     // Path B (data-dependent)
    } else {
        state = INSUFFICIENT_FUNDS; // Path C (data-dependent)
    }
}
```
Same input (SELECT_ITEM) → 3 possible next states ❌ NOT DETERMINISTIC

**After (True DFA):**
```javascript
transition_table['COIN_INSERTED']['SELECT_ITEM'] = 'ITEM_SELECTED'
// Always same transition
// Data validation happens separately (stays in COIN_INSERTED if invalid)
```
Same input → 1 defined next state ✓ DETERMINISTIC

---

## State Diagram

```
        ┌─────────────────────────────────────┐
        │                                     │
        v                                     │
    ┌────────┐                           ┌────────┐
    │ q₀     │                           │ q₄     │
    │ IDLE   │<──────────────────────────│CHANGE  │
    └───┬────┘                           └─────^──┘
        │ c₅,c₁₀,c₂₀                           │
        │                                     │
        v                                     │
    ┌────────┐                                │
    │ q₁     │────────────────────────────────┘
    │ COIN   │ x (CANCEL)
    └───┬────┘
        │ s (SELECT_ITEM)*
        │
        v
    ┌────────┐
    │ q₂     │
    │ ITEM   │
    └───┬────┘
        │ k (CONFIRM)
        │
        v
    ┌────────┐
    │ q₃     │
    │ DISP   │
    └───┬────┘
        │ (auto-transition after 2s)
        │
        v
    ┌────────┐
    │ q₄     │
    │CHANGE  │
    │        │
    └────────┘

Legend:
  * = Conditional transition (validation outside FSM)
  → = Transition on input symbol
```

---

## Implementation Notes

### Validation vs. State Transition
- **Data validation** (balance ≥ price, stock > 0) is performed **before** the FSM transition
- If validation **fails**, the machine **rejects the input** (no state change)
- If validation **passes**, the transition proceeds normally
- This maintains **true DFA determinism**

### Database Logging
All state transitions are logged to:
- `data/machine_history.json` (structured)
- `data/machine_history.txt` (human-readable)

### Input Processing
1. User clicks button/coin
2. UI determines specific input symbol (COIN_5 vs COIN_10 vs COIN_20)
3. Validation checks run (balance, stock)
4. If valid → DFA transition executes
5. If invalid → Logged but FSM stays in current state

---

## CS 109 Course Alignment

This implementation demonstrates:
- ✓ Formal DFA definition (Q, Σ, δ, q₀, F)
- ✓ Deterministic transitions: δ(q, σ) → q
- ✓ State diagram representation
- ✓ Input alphabet specification
- ✓ Acceptance condition
- ✓ Separation of data validation and FSM logic
- ✓ Executable automaton with real-world application

---

**Last Updated:** December 17, 2025  
**Course:** CS 109 - Automata Theory  
**Project:** Vending Machine DFA Simulator
