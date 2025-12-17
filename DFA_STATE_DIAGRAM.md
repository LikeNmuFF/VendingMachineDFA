# Vending Machine DFA - Visual State Diagram

## ASCII State Diagram

```
                    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                    ┃                                      ┃
                    ┃                                      ┃
                    ┃          START: RESET (r)            ┃
                    ┃          END: COLLECT_CHANGE (g)     ┃
                    ┃                                      ┃
                    ┗━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┛
                              ║
                              ║
                      ┌───────▼──────┐
                      │   q₀: IDLE   │ ◄─────────────────────┐
                      │              │                       │
                      │ Balance: 0   │                       │
                      │ Awaiting $   │                       │
                      └───────┬──────┘                       │
                              │                              │
              ┌───────────────┼───────────────┐              │
              │               │               │              │
              │ c₅ (₱5)       │ c₁₀ (₱10)    │ c₂₀ (₱20)   │
              │               │               │              │
              ▼               ▼               ▼              │
         ┌──────────────────────────────────────┐            │
         │  q₁: COIN_INSERTED                   │            │
         │                                      │            │
         │  • Balance: ₱5/₱10/₱20               │            │
         │  • Awaiting item selection            │            │
         │                                      │            │
         │  ◄─────── c₅/c₁₀/c₂₀ (Add more $)    │            │
         │                                      │            │
         └──────┬──────┬────────┬──────────────┘            │
                │      │        │                            │
                │      │        │                            │
                │      │        └─────► x (CANCEL)           │
                │      │                │                    │
                │      │        ┌───────▼────────────┐       │
                │      │        │ q₄: RETURNING_     │       │
                │      │        │      CHANGE        │       │
                │      │        │                    │       │
                │      │        │ Return $ to user   │       │
                │      │        │                    │       │
                │      │        └───────┬────────────┘       │
                │      │                │                    │
                │      │                │ g (COLLECT_CHANGE) │
                │      │                └────────────────────┘
                │      │
                │      │ s (SELECT_ITEM)*
                │      │ *Validation: stock>0 & balance≥price
                │      │ If valid: transition → q₂
                │      │ If invalid: stay in q₁ (log error)
                │      │
                │      ▼
                │  ┌──────────────────────────┐
                │  │ q₂: ITEM_SELECTED        │
                │  │                          │
                │  │ Item chosen and ready    │
                │  │ Awaiting confirmation    │
                │  │                          │
                │  │ Selected: [Product]      │
                │  └──────┬───────────────────┘
                │         │
                │         │ k (CONFIRM)
                │         │
                │         ▼
                │     ┌──────────────────────────┐
                │     │ q₃: DISPENSING           │
                │     │                          │
                │     │ Dispensing item...       │
                │     │ (2-second animation)     │
                │     │                          │
                │     │ Auto → q₄ after 2s      │
                │     └──────┬───────────────────┘
                │            │
                │            │ (auto-transition)
                │            ▼
                └────────► q₄ → q₀
                         Return change
                         & reset


        r (RESET)
        ━━━━━━━━
    From any state → q₀ (IDLE)

```

## Transition Table (Formal Mathematical Notation)

```
δ(state, input) → next_state

┌────────────────────┬──────────┬────────┬────────┬───────────┬─────────┬────────┬──────┬──────────────┐
│ Current State      │ c₅       │ c₁₀    │ c₂₀    │ SELECT_s  │ CONFIRM │ CANCEL │ RESET│ COLLECT_g    │
├────────────────────┼──────────┼────────┼────────┼───────────┼─────────┼────────┼──────┼──────────────┤
│ q₀ (IDLE)          │ q₁       │ q₁     │ q₁     │ ∅         │ ∅       │ ∅      │ q₀   │ ∅            │
├────────────────────┼──────────┼────────┼────────┼───────────┼─────────┼────────┼──────┼──────────────┤
│ q₁ (COIN_INSERTED) │ q₁       │ q₁     │ q₁     │ q₂*       │ ∅       │ q₄     │ q₀   │ ∅            │
├────────────────────┼──────────┼────────┼────────┼───────────┼─────────┼────────┼──────┼──────────────┤
│ q₂ (ITEM_SELECTED) │ ∅        │ ∅      │ ∅      │ ∅         │ q₃      │ q₄     │ q₀   │ ∅            │
├────────────────────┼──────────┼────────┼────────┼───────────┼─────────┼────────┼──────┼──────────────┤
│ q₃ (DISPENSING)    │ ∅        │ ∅      │ ∅      │ ∅         │ ∅       │ ∅      │ ∅    │ ∅            │
├────────────────────┼──────────┼────────┼────────┼───────────┼─────────┼────────┼──────┼──────────────┤
│ q₄ (RETURNING_     │ ∅        │ ∅      │ ∅      │ ∅         │ ∅       │ ∅      │ q₀   │ q₀           │
│    CHANGE)         │          │        │        │           │         │        │      │              │
└────────────────────┴──────────┴────────┴────────┴───────────┴─────────┴────────┴──────┴──────────────┘

Legend:
  q₀, q₁, q₂, q₃, q₄ = States (shown in column headers)
  ∅ = Invalid transition (no state change, error logged)
  * = Conditional transition (validation outside FSM)
    ├─ If stock = 0 → No transition (error logged)
    └─ If balance < price → No transition (error logged)
  Auto = Automatic transition (triggered by timer, not user input)
```

## State Properties

### q₀: IDLE (Initial & Accepting State)
```
Properties:
  • Starting state of machine
  • Machine is ready to accept coins
  • No item selected
  • Balance = 0
  • No change pending

Transitions:
  • Input: c₅, c₁₀, c₂₀ → q₁ (Accept coins)
  • Input: RESET → q₀ (Self-loop, no change)

Valid Next Inputs:
  • Coins (c₅, c₁₀, c₂₀) ✓
  • RESET ✓
  • Other inputs ✗ (no transition)
```

### q₁: COIN_INSERTED
```
Properties:
  • Money inserted into machine
  • Balance > 0
  • Awaiting item selection or more coins
  • No item selected yet

Transitions:
  • Input: c₅, c₁₀, c₂₀ → q₁ (Add more coins)
  • Input: SELECT_ITEM* → q₂ (*if valid: stock>0, balance≥price)
  • Input: CANCEL → q₄ (Return money)
  • Input: RESET → q₀ (Discard balance)

Valid Next Inputs:
  • More coins (c₅, c₁₀, c₂₀) ✓
  • SELECT_ITEM ✓ (triggers validation)
  • CANCEL ✓
  • RESET ✓

Invalid Inputs (no transition):
  • CONFIRM ✗ (no item selected)
  • COLLECT_CHANGE ✗ (no change yet)

Special Behavior:
  • If SELECT_ITEM with insufficient funds → stay in q₁, log error
  • If SELECT_ITEM but item out of stock → stay in q₁, log error
```

### q₂: ITEM_SELECTED
```
Properties:
  • Item selected successfully
  • Balance ≥ item price (guaranteed)
  • Item in stock (guaranteed)
  • Awaiting confirmation to purchase

Transitions:
  • Input: CONFIRM → q₃ (Dispense item)
  • Input: CANCEL → q₄ (Cancel, return money)
  • Input: RESET → q₀ (Reset machine)

Valid Next Inputs:
  • CONFIRM ✓
  • CANCEL ✓
  • RESET ✓

Invalid Inputs (no transition):
  • Coins (c₅, c₁₀, c₂₀) ✗
  • SELECT_ITEM ✗ (new selection requires CANCEL first)
  • COLLECT_CHANGE ✗ (no change yet)
```

### q₃: DISPENSING
```
Properties:
  • Currently dispensing item
  • Animation running (2 seconds)
  • Item being physically delivered
  • No user input accepted

Transitions:
  • (Auto) Timer expires → q₄ (Move to change return)

Valid Next Inputs:
  • None during dispensing (machine is busy)

Special Behavior:
  • All user inputs ignored during dispensing
  • Automatic transition after 2 seconds
  • Plays dispensing animation/sound
  • Updates inventory (product.stock -= 1)
  • Calculates change = balance - item.price
```

### q₄: RETURNING_CHANGE (Final State)
```
Properties:
  • Item dispensed (or cancelled)
  • Change pending to return
  • Awaiting user to collect change/coins
  • Transaction complete (almost)

Transitions:
  • Input: COLLECT_CHANGE → q₀ (Return to IDLE)
  • Input: RESET → q₀ (Reset machine)

Valid Next Inputs:
  • COLLECT_CHANGE ✓
  • RESET ✓

Invalid Inputs:
  • All others (coins, selections) ✗

Special Behavior:
  • User must collect change before continuing
  • If change = 0, must still click COLLECT_CHANGE to proceed
  • Only way to return to q₀
  • Completes transaction cycle
```

---

## Input Symbol Definitions

| Symbol | Code | Meaning | Triggered By | Valid States |
|--------|------|---------|--------------|--------------|
| **c₅** | COIN_5 | Insert ₱5 coin | User clicks ₱5 button | q₀, q₁ |
| **c₁₀** | COIN_10 | Insert ₱10 coin | User clicks ₱10 button | q₀, q₁ |
| **c₂₀** | COIN_20 | Insert ₱20 coin | User clicks ₱20 button | q₀, q₁ |
| **s** | SELECT_ITEM | Select product | User clicks item (A1-C3) | q₁ (with validation) |
| **k** | CONFIRM | Confirm purchase | User clicks "Confirm" | q₂ |
| **x** | CANCEL | Cancel transaction | User clicks "Cancel" | q₁, q₂ |
| **r** | RESET | Reset to IDLE | User clicks "Reset" | q₀, q₁, q₂, q₄ |
| **g** | COLLECT_CHANGE | Collect change/coins | User clicks "Collect" | q₄ |

---

## Example Transactions

### Transaction 1: ₱20 Coins → Water (₱20)

```
Sequence: c₂₀ → s(Water) → k → g

1. START: q₀ (IDLE)
   [User inserts ₱20 coin]
   Input: c₂₀ (COIN_20)
   Action: balance += 20
   Output: "Inserted ₱20.00 → Balance: ₱20.00"
   → q₁ (COIN_INSERTED)

2. STATE: q₁ (COIN_INSERTED)
   [User clicks Water (₱20)]
   Input: s (SELECT_ITEM) with data="C1"
   Validation: stock(C1)=8 ✓, balance(₱20)≥price(₱20) ✓
   Action: selectedItem = Water
   Output: "✓ Selected: Water - ₱20.00"
   → q₂ (ITEM_SELECTED)

3. STATE: q₂ (ITEM_SELECTED)
   [User clicks Confirm]
   Input: k (CONFIRM)
   Action: 
     • Dispense Water
     • Reduce stock: 8 → 7
     • Calculate change: ₱20 - ₱20 = ₱0
   Output: "💧 Dispensing Water..."
   → q₃ (DISPENSING)
   → [After 2s] q₄ (RETURNING_CHANGE)

4. STATE: q₄ (RETURNING_CHANGE)
   [User clicks Collect Change]
   Input: g (COLLECT_CHANGE)
   Action:
     • Return ₱0 (no change)
     • Save transaction to database
     • Reset machine state
   Output: "✓ Transaction complete - Thank you!"
   → q₀ (IDLE) [ACCEPTING STATE]
```

### Transaction 2: Insufficient Funds (Validation Failure)

```
Sequence: c₅ → s(Cola₱25) → [ERROR] → c₁₀ → s(Cola₱25) → [ERROR] → c₅ → s(Cola₱25) → k

1. START: q₀ (IDLE)
   Input: c₅ (COIN_5)
   → q₁ (balance = ₱5)

2. STATE: q₁
   Input: s (SELECT_ITEM) with data="A1" [Cola ₱25]
   Validation: balance(₱5) < price(₱25) ✗
   Action: NO STATE CHANGE - stay in q₁
   Output: "❌ INSUFFICIENT FUNDS: Need ₱20 more for Cola"
   → q₁ (COIN_INSERTED) [NO CHANGE]

3. STATE: q₁ [Still here]
   Input: c₁₀ (COIN_10)
   Action: balance += 10
   Output: "Inserted ₱10.00 → Balance: ₱15.00"
   → q₁ (self-loop)

4. STATE: q₁ (balance = ₱15)
   Input: s (SELECT_ITEM) with data="A1" [Cola ₱25]
   Validation: balance(₱15) < price(₱25) ✗
   Action: NO STATE CHANGE - stay in q₁
   Output: "❌ INSUFFICIENT FUNDS: Need ₱10 more for Cola"
   → q₁ (NO CHANGE)

5. STATE: q₁ [Still here]
   Input: c₅ (COIN_5)
   Action: balance += 5
   Output: "Inserted ₱5.00 → Balance: ₱20.00"
   → q₁ (self-loop)

6. STATE: q₁ (balance = ₱20)
   Input: s (SELECT_ITEM) with data="A1" [Cola ₱25]
   Wait, that's only ₱20, Cola is ₱25... Still insufficient!
   
   [Assuming user meant to add more or select cheaper item...]
   Let's say user adds ₱10:
   Input: c₁₀
   → q₁ (balance = ₱30)

7. STATE: q₁ (balance = ₱30)
   Input: s (SELECT_ITEM) with data="A1" [Cola ₱25]
   Validation: stock(A1)=5 ✓, balance(₱30)≥price(₱25) ✓
   Action: selectedItem = Cola
   Output: "✓ Selected: Cola - ₱25.00"
   → q₂ (ITEM_SELECTED) [FINALLY!]

8. STATE: q₂
   Input: k (CONFIRM)
   Action:
     • Dispense Cola
     • change = ₱30 - ₱25 = ₱5
   → q₃ → q₄

9. STATE: q₄
   Input: g (COLLECT_CHANGE)
   Output: "💰 Returned: ₱5.00"
   → q₀ (IDLE) ✓

Key Point: 
  In steps 2 and 4, SELECT_ITEM with insufficient funds did NOT change state.
  The machine remained in q₁, allowing the user to add more coins.
  This is DFA determinism: same (state, input) → same behavior.
```

### Transaction 3: Cancel & Reset

```
Sequence: c₁₀ → c₁₀ → x → g → r

1. q₀ + c₁₀ → q₁ (balance = ₱10)
2. q₁ + c₁₀ → q₁ (balance = ₱20)
3. q₁ + x (CANCEL)
   → q₄ (RETURNING_CHANGE)
4. q₄ + g (COLLECT_CHANGE)
   Output: "💰 Returned: ₱20.00"
   → q₀ (IDLE)
5. q₀ + r (RESET) [Optional, already in IDLE]
   → q₀ (no change, already reset)
```

---

**Visual Diagram Created:** December 17, 2025
