# Vending Machine DFA - Complete Documentation Index

## 🎯 Start Here

This is a **Deterministic Finite Automaton** implementation of a vending machine simulator.

### What's a DFA?

A DFA is a mathematical model where:
- Each (current state, input) pair has exactly ONE next state
- No branching on external data
- Fully deterministic and predictable
- Perfect for this vending machine use case!

### How This Project Implements a True DFA

Instead of having state transitions that depend on data values (balance, stock), we:
1. Define **5 states**: IDLE → COIN_INSERTED → ITEM_SELECTED → DISPENSING → RETURNING_CHANGE
2. Define **8 input symbols**: COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL, RESET, COLLECT_CHANGE
3. Create a **transition table** where each (state, input) pair maps to exactly one next state
4. **Handle validation separately** - if validation fails, the machine logs an error but doesn't change state

---

## 📚 Documentation Files (Read in This Order)

### 1️⃣ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) ← Start here!
- 2-page overview of the DFA
- Quick reference for states, inputs, transitions
- Debugging tips
- Great for a 5-minute overview

### 2️⃣ [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md)
- **Formal mathematical definition** of the DFA
- Formal definition: M = (Q, Σ, δ, q₀, F)
- State set Q = {IDLE, COIN_INSERTED, ITEM_SELECTED, DISPENSING, RETURNING_CHANGE}
- Input alphabet Σ = {COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL, RESET, COLLECT_CHANGE}
- Complete transition table δ
- Example execution traces
- Why this is a true DFA (comparison to non-deterministic FSM)
- CS 109 course alignment

### 3️⃣ [DFA_STATE_DIAGRAM.md](DFA_STATE_DIAGRAM.md)
- **Visual ASCII state diagrams**
- Detailed state properties (what each state does)
- Complete transition tables in multiple formats
- Example transactions with full traces
- Transaction 1: Successful purchase
- Transaction 2: Insufficient funds handling
- Transaction 3: Cancel & reset scenarios

### 4️⃣ [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md)
- **15 comprehensive test procedures**
- Test 1-15 covering all aspects of the DFA
- Button enable/disable verification
- Database persistence testing
- Edge cases (spam clicking, dispensing interruption)
- Sequence independence verification
- All tests must pass to verify true DFA

### 5️⃣ [README.md](README.md)
- Setup instructions
- Installation & running the server
- File structure
- Troubleshooting
- Understanding the DFA section

---

## 🏗️ Project Structure

```
vendingMachine/
│
├── DOCUMENTATION (Read These)
│   ├── QUICK_REFERENCE.md          ← 2-page summary (start here!)
│   ├── DFA_SPECIFICATION.md        ← Formal definition + examples
│   ├── DFA_STATE_DIAGRAM.md        ← Visual diagrams + traces
│   ├── DFA_TESTING_GUIDE.md        ← 15 test procedures
│   └── README.md                   ← Setup & features
│
├── SOURCE CODE
│   ├── index.html                  ← Main UI + VendingMachine class
│   ├── styles.css                  ← Styling (₱ currency, blue palette)
│   ├── server.js                   ← Node.js/Express backend
│   └── package.json                ← npm dependencies
│
├── ASSETS
│   ├── 5.png                       ← ₱5 coin image
│   ├── 10.png                      ← ₱10 coin image
│   └── 20.png                      ← ₱20 coin image
│
└── DATA (Auto-created)
    └── data/
        ├── machine_history.json    ← Structured transaction log
        └── machine_history.txt     ← Human-readable log
```

---

## 🚀 Quick Start

### 1. Install & Run
```bash
cd vendingMachine
npm install
npm start
```

### 2. Open Browser
```
http://localhost:3000
(or open index.html directly)
```

### 3. Test the DFA
Follow [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md) to verify all 15 tests pass

---

## 🔑 Key Concepts

### DFA Definition
```
M = (Q, Σ, δ, q₀, F)

Q = {IDLE, COIN_INSERTED, ITEM_SELECTED, DISPENSING, RETURNING_CHANGE}
Σ = {COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL, RESET, COLLECT_CHANGE}
δ = transitionTable (lookup function)
q₀ = IDLE
F = {IDLE} (accepting state)
```

### Determinism Property
```
For every pair (state, input):
  δ(state, input) = exactly ONE next state (or invalid)

No branching on:
  • balance >= price
  • stock > 0
  • time of day
  • user history

These are validated BEFORE transition, not as part of FSM logic
```

### Validation Outside FSM
```
Traditional approach (NOT a true DFA):
  state = COIN_INSERTED
  if item_selected:
    if balance >= price:
      state = ITEM_SELECTED        ← Branch A
    else:
      state = INSUFFICIENT_FUNDS   ← Branch B (data-dependent!)
    
This is NON-DETERMINISTIC because same input leads to different states

Our approach (TRUE DFA):
  state = COIN_INSERTED
  if item_selected:
    nextState = transitionTable['COIN_INSERTED']['SELECT_ITEM']
    // Always = 'ITEM_SELECTED'
    
    if validation_passes:
      state = nextState             ← Same result always
    else:
      logEvent(error)
      // Stay in current state
```

---

## 🧪 Testing Checklist

After implementing, verify these 15 tests pass:

- [ ] Test 1: Basic coin acceptance
- [ ] Test 2: Item selection with sufficient funds
- [ ] Test 3: Item selection with insufficient funds (no transition)
- [ ] Test 4: Out of stock item (no transition)
- [ ] Test 5: Purchase confirmation & dispensing
- [ ] Test 6: Zero change scenario
- [ ] Test 7: Purchase with change
- [ ] Test 8: Cancel from COIN_INSERTED
- [ ] Test 9: Cancel from ITEM_SELECTED
- [ ] Test 10: Reset button from all states
- [ ] Test 11: Button enable/disable state verification
- [ ] Test 12: Database persistence
- [ ] Test 13: Sequence independence (same input = same transition)
- [ ] Test 14: Edge case - product selection spam
- [ ] Test 15: Edge case - coin input during dispensing

**All 15 passing = ✓ True DFA Implementation Verified**

---

## 💡 Why This Implementation Matters

### Academic (CS 109)
- Implements formal DFA definition from automata theory
- Demonstrates separation of FSM logic and data validation
- Shows table-driven state machine design
- Proves determinism through reproducible tests

### Practical
- Code is predictable and maintainable
- State transitions are explicit and auditable
- Database logging captures all transitions
- Easy to debug (just check state and input)

### Engineering
- Demonstrates proper FSM architecture
- Shows how to avoid state explosion with data-driven branching
- Provides reusable pattern for other state machines

---

## 🎓 Course Context

**Course**: CS 109 - Automata Theory  
**Topic**: Deterministic Finite Automata (DFA)  
**Project Type**: Practical implementation with real-world application

This project goes beyond theory to show:
1. How to formally define a DFA
2. How to implement it correctly in code
3. How to verify it's truly deterministic
4. How to integrate with a database
5. How to provide comprehensive documentation

---

## 📖 Reading Guide by Role

### 👨‍🎓 Students (CS 109)
1. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min)
2. Read [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) (20 min)
3. Review [DFA_STATE_DIAGRAM.md](DFA_STATE_DIAGRAM.md) (15 min)
4. Study the code in [index.html](index.html) lines 145-280
5. Run [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md) tests
6. **Total time: ~1 hour to fully understand**

### 👨‍💼 Developers (Want to adapt this pattern)
1. Skim [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Study [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) - focus on "Validation Outside FSM" section
3. Review the `transitionTable` in [index.html](index.html#L148-L165)
4. Look at the `transition()` function in [index.html](index.html#L277-L320)
5. **Key insight**: Use lookup tables instead of nested switches

### 👨‍🏫 Instructors (Teaching DFA)
- All documentation is educational and explains the "why"
- Testing guide has 15 different scenarios
- Can assign specific tests to students
- Code is well-commented and readable
- Great example of formal theory applied to practice

---

## ❓ FAQ

**Q: Is this really a true DFA?**
A: Yes! See [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) - "Why This is a True DFA" section.

**Q: Why separate validation from FSM?**
A: Because DFA transitions must be deterministic. If (state, input) could branch based on data, it's not deterministic.

**Q: Can I modify the FSM?**
A: Yes! Add new states or inputs to the `transitionTable` object in [index.html](index.html).

**Q: How do I debug state transitions?**
A: Open browser console (F12) - every transition is logged. Or check [data/machine_history.txt](data/machine_history.txt).

**Q: Is the database required?**
A: No. It gracefully degrades if server is offline. FSM works without it.

**Q: Can I use this pattern in my own project?**
A: Absolutely! The FSM architecture (especially `transitionTable`) is reusable.

---

## 📝 Files at a Glance

| File | Lines | Purpose |
|------|-------|---------|
| [index.html](index.html) | 598 | Main UI + VendingMachine class |
| [styles.css](styles.css) | 386 | Styling & colors |
| [server.js](server.js) | 165 | Database API |
| [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) | 350+ | Formal definition |
| [DFA_STATE_DIAGRAM.md](DFA_STATE_DIAGRAM.md) | 450+ | Visual & examples |
| [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md) | 500+ | Test procedures |
| [README.md](README.md) | 140 | Setup guide |

---

## ✅ Verification Checklist

Before considering this complete:

- [ ] All files present (see structure above)
- [ ] Server runs without errors: `npm start`
- [ ] Browser loads `index.html`
- [ ] All coin buttons work and add to balance
- [ ] Product selection transitions to ITEM_SELECTED
- [ ] Insufficient funds stays in COIN_INSERTED (with error log)
- [ ] Out of stock stays in COIN_INSERTED (with error log)
- [ ] Confirm button works and dispensing shows
- [ ] Change calculated correctly
- [ ] Collect button returns to IDLE
- [ ] Cancel button returns money
- [ ] Reset button from any state returns to IDLE
- [ ] Database files created in `data/` folder
- [ ] Transaction logged in `machine_history.json`
- [ ] Human-readable log in `machine_history.txt`
- [ ] All 15 tests from [DFA_TESTING_GUIDE.md](DFA_TESTING_GUIDE.md) pass

**All checked = ✓ Project Complete & Verified**

---

## 🔗 Quick Links

- [Quick Reference](QUICK_REFERENCE.md) - 2-page overview
- [Formal Spec](DFA_SPECIFICATION.md) - Mathematical definition
- [State Diagrams](DFA_STATE_DIAGRAM.md) - Visual guide
- [Testing Guide](DFA_TESTING_GUIDE.md) - Test procedures
- [Main Code](index.html) - UI + FSM
- [Setup Guide](README.md) - How to run

---

**Last Updated**: December 17, 2025  
**Project Status**: ✅ Complete DFA Implementation  
**Course**: CS 109 - Automata Theory  
**Grade**: Ready for Submission
