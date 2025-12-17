# Vending Machine DFA - Quick Reference

## What is a DFA?

A **Deterministic Finite Automaton** is a mathematical model with exactly ONE next state for every (current state, input) pair.

```
No branching on data values
Same input in same state = Always same next state
```

## Your Implementation

### The 5 States (Q)
```
q₀: IDLE  ──  Ready, no coins
q₁: COIN_INSERTED  ──  Money inserted
q₂: ITEM_SELECTED  ──  Item chosen
q₃: DISPENSING  ──  Delivering item (auto-transition)
q₄: RETURNING_CHANGE  ──  Money to return
```

### The 8 Input Symbols (Σ)
```
c₅    COIN_5
c₁₀   COIN_10  
c₂₀   COIN_20
s     SELECT_ITEM
k     CONFIRM
x     CANCEL
r     RESET
g     COLLECT_CHANGE
```

### The Transition Table (δ)

```javascript
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
        'SELECT_ITEM': 'ITEM_SELECTED',  // if validation passes
        'CANCEL': 'RETURNING_CHANGE',
        'RESET': 'IDLE'
    },
    'ITEM_SELECTED': {
        'CONFIRM': 'DISPENSING',
        'CANCEL': 'RETURNING_CHANGE',
        'RESET': 'IDLE'
    },
    'DISPENSING': {
        // Auto-transitions after 2 seconds to RETURNING_CHANGE
    },
    'RETURNING_CHANGE': {
        'COLLECT_CHANGE': 'IDLE',
        'RESET': 'IDLE'
    }
}
```

## Key Principle: Validation ≠ State Change

```javascript
// BEFORE (Non-deterministic):
if (balance >= price && stock > 0) {
    state = ITEM_SELECTED;  // Path A
} else if (stock === 0) {
    state = OUT_OF_STOCK;   // Path B (DATA-DEPENDENT!)
} else {
    state = INSUFFICIENT;   // Path C (DATA-DEPENDENT!)
}

// AFTER (True DFA):
const nextState = transitionTable[state][input];
if (nextState) {
    state = nextState;  // Deterministic lookup
} else {
    // Stay in current state, log error
    logEvent("Validation failed: " + error);
}
```

## Directory Structure

```
vendingMachine/
├── index.html                 (Main UI + VendingMachine class)
├── styles.css                 (Custom color palette)
├── server.js                  (Node.js/Express backend)
├── package.json              (Dependencies)
├── 5.png, 10.png, 20.png    (Coin images)
│
├── DFA_SPECIFICATION.md      ← FORMAL DEFINITION
├── DFA_STATE_DIAGRAM.md      ← VISUAL DIAGRAMS
├── DFA_TESTING_GUIDE.md      ← TESTING PROCEDURES
├── README.md                 (Setup & overview)
│
└── data/                     (Auto-created)
    ├── machine_history.json
    └── machine_history.txt
```

## Running the Project

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Open browser
# Navigate to index.html or http://localhost:3000
```

## Example: Complete Transaction

```
User inserts coins → q₀ ─c₂₀→ q₁ ─c₁₀→ q₁ ─c₅→ q₁

User selects item → q₁ ─s→ q₂

User confirms → q₂ ─k→ q₃ ─(auto)→ q₄

User collects → q₄ ─g→ q₀ [COMPLETE]

Trace: q₀ → q₁ → q₁ → q₁ → q₂ → q₃ → q₄ → q₀
```

## Why This Matters (CS 109)

| Property | Non-DFA | Your DFA |
|----------|---------|---------|
| Data-based branching | ✓ (Has it) | ✗ (No) |
| Multiple paths for same input | ✓ (Yes) | ✗ (No) |
| Deterministic transitions | ✗ (No) | ✓ (Yes) |
| Table-driven logic | ✗ (No) | ✓ (Yes) |
| Formal state definition | ✗ (No) | ✓ (Yes) |

---

## Quick Debugging

**Machine stuck in COIN_INSERTED?**
→ This is normal! Validation failed (insufficient funds or out of stock)
→ Add more coins or select a different item

**Balance not showing?**
→ Check browser console for errors
→ Verify you're in q₀ (IDLE) first

**Database says "offline"?**
→ Is server running? (`npm start`)
→ Is port 3000 available?

**Want to see state transitions?**
→ Open browser console (F12)
→ All transitions logged

---

## Documentation Files

| File | Purpose |
|------|---------|
| [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) | Formal mathematical definition |
| [DFA_STATE_DIAGRAM.md](DFA_STATE_DIAGRAM.md) | Visual diagrams & traces |
| [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md) | 15 test procedures |
| [README.md](README.md) | Setup & features |

---

## The Transition Function (Algorithm)

```javascript
// Core DFA Logic
transition(input) {
    // Step 1: Lookup next state from table
    const nextState = this.transitionTable[this.state]?.[input];
    
    // Step 2: If no valid transition, stay in current state
    if (!nextState) {
        this.logEvent("Invalid input for current state");
        return;  // No state change
    }
    
    // Step 3: Execute side effects (add coins, select item, etc)
    switch (input) {
        case 'COIN_5': this.balance += 5; break;
        case 'COIN_10': this.balance += 10; break;
        case 'COIN_20': this.balance += 20; break;
        case 'SELECT_ITEM': 
            if (validation passes) {
                this.selectedItem = item;
            } else {
                this.logEvent(error);
                return;  // Stay in current state
            }
            break;
        // ... etc
    }
    
    // Step 4: Update state
    this.state = nextState;
}
```

---

## Coins & Products

**Coin Denominations**: ₱5, ₱10, ₱20

**Products** (9 total):
- A1: Cola (₱25) 
- A2: Diet Cola (₱24)
- A3: Lemonade (₱22)
- B1: Chips (₱30)
- B2: Chocolate (₱35)
- B3: Cookies (₱28) [out of stock]
- C1: Water (₱20)
- C2: Energy Drink (₱40)
- C3: Juice (₱27)

---

**Created**: December 17, 2025  
**Course**: CS 109 - Automata Theory  
**Status**: ✓ Complete DFA Implementation
