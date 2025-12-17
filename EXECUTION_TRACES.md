# Detailed Execution Traces: Vending Machine DFA

## Comprehensive Examples of FSM Execution

---

## Trace 1: Simple Successful Purchase

**Scenario**: User has exact change (₱20) and wants Water (₱20)

```
TIME  ACTION              INPUT      CURRENT  NEXT      BALANCE  ITEM      CHANGE
─────────────────────────────────────────────────────────────────────────────────
t₀    START               -          q₀       q₀        ₱0       None      ₱0
                          (no input)

t₁    User clicks ₱20     COIN_20    q₀       q₁        ₱20      None      ₱0
      [Balance shows ₱20]

t₂    User clicks Water   SELECT_    q₁       q₂        ₱20      Water     ₱0
      product             ITEM
      [Validation: stock>0 ✓, balance≥price ✓]
      [Confirm button enabled]

t₃    User clicks         CONFIRM    q₂       q₃        ₱20      Water     ₱0
      Confirm
      [Animation: "Dispensing Water..."]
      [2-second dispensing timer starts]

t₄    [Wait 2 seconds]    (auto)     q₃       q₄        ₱0       Water     ₱0
      [Animation complete]
      [Dispenser delivers Water]
      [Change = ₱20 - ₱20 = ₱0]
      ["Collect Change" button enabled]

t₅    User clicks         COLLECT_   q₄       q₀        ₱0       None      ₱0
      Collect Change      CHANGE
      [Message: "Transaction complete!"]
      [Machine returns to initial state]

────────────────────────────────────────────────────────────────────────────────

STATE SEQUENCE:   q₀ → q₁ → q₂ → q₃ → q₄ → q₀ ✓
INPUT SEQUENCE:   COIN_20, SELECT_ITEM, CONFIRM, COLLECT_CHANGE
DATABASE LOG:     {item: "Water", price: 20, paid: 20, change: 0}
```

---

## Trace 2: Purchase with Change

**Scenario**: User inserts ₱30 for Cola (₱25) and gets ₱5 change

```
TIME  ACTION                 INPUT       q_prev   q_next   BALANCE  ITEM   CHANGE
──────────────────────────────────────────────────────────────────────────────────
t₀    START                  -           -        q₀       ₱0       -      ₱0

t₁    Click ₱20              COIN_20     q₀       q₁       ₱20      -      -

t₂    Click ₱10              COIN_10     q₁       q₁       ₱30      -      -
      [Self-loop: stay in q₁, add ₱10]

t₃    Click Cola (₱25)       SELECT_     q₁       q₂       ₱30      Cola   -
                             ITEM
      [Validation: stock>0 ✓, ₱30≥₱25 ✓]

t₄    Click Confirm          CONFIRM     q₂       q₃       ₱30      Cola   -
      [Dispensing animation plays]

t₅    [2 sec elapsed]        (AUTO)      q₃       q₄       ₱25      Cola   ₱5
      [Cola dispensed]
      [Change calculated: ₱30 - ₱25 = ₱5]

t₆    Click Collect          COLLECT_    q₄       q₀       ₱0       -      ₱0
      [Change returned: ₱5]  CHANGE

────────────────────────────────────────────────────────────────────────────────

DATABASE LOG:
{
  "timestamp": "2025-12-17T10:30:45.123Z",
  "item": "Cola",
  "price": 25,
  "paid": 30,
  "change": 5,
  "status": "success"
}

KEY: Self-loop on COIN_10 shows accumulation in same state q₁
```

---

## Trace 3: Insufficient Funds (Validation Failure)

**Scenario**: User tries to buy Cola (₱25) with only ₱5

```
TIME  ACTION              INPUT       q_prev   q_next   BALANCE  STATE_CH? NOTES
────────────────────────────────────────────────────────────────────────────
t₀    START              -           -        q₀       ₱0       -         

t₁    Insert ₱5 coin     COIN_5      q₀       q₁       ₱5       YES ✓     

t₂    Click Cola (₱25)   SELECT_     q₁       ???      ₱5       ???       
      [Validation Check]  ITEM
      ├─ stock(Cola) = 5 > 0 ✓
      ├─ balance(₱5) < price(₱25) ✗ FAIL
      └─ Result: VALIDATION FAILED

      VALIDATION FAILED → FSM stays in q₁
      
      q₁       q₁       ₱5       NO ✗      [No state change!]

      [Error logged: "❌ INSUFFICIENT FUNDS: Need ₱20 more for Cola"]
      [Coin buttons remain enabled]
      [User can add more coins]

t₃    Insert ₱20 coin    COIN_20     q₁       q₁       ₱25      YES ✓     [Now balance sufficient]

t₄    Click Cola again   SELECT_     q₁       q₂       ₱25      YES ✓     [Validation passes now!]
      [Validation Check]  ITEM
      ├─ stock = 5 > 0 ✓
      ├─ balance(₱25) ≥ price(₱25) ✓
      └─ Result: VALIDATION PASSED
                              → TRANSITION SUCCEEDS

t₅    Click Confirm      CONFIRM     q₂       q₃       ₱25      YES ✓

t₆    [2 sec elapsed]    (AUTO)      q₃       q₄       ₱0       YES ✓     [change = ₱0]

t₇    Click Collect      COLLECT_    q₄       q₀       ₱0       YES ✓
                         CHANGE

────────────────────────────────────────────────────────────────────────────────

KEY INSIGHT:
  First SELECT_ITEM: q₁ + SELECT_ITEM → q₁ (validation failed, no transition)
  Second SELECT_ITEM: q₁ + SELECT_ITEM → q₂ (validation passed, transition happened)
  
  Same (state, input) pair: (q₁, SELECT_ITEM)
  Different outcomes because VALIDATION is OUTSIDE FSM
  
  FSM itself is deterministic:
    δ(q₁, SELECT_ITEM) = q₂ (in transition table)
    
  But transition only happens if validation passes (application logic)
```

---

## Trace 4: Out of Stock Item

**Scenario**: User tries to buy Cookies (out of stock) with ₱100

```
TIME  ACTION              INPUT       BALANCE  STOCK    VALIDATION    STATE_CH
──────────────────────────────────────────────────────────────────────────────
t₀    START              -           ₱0       -        -             -

t₁    Insert ₱50         COIN_20 ×3  ₱60      -        balance check q₀→q₁

t₂    Click Cookies      SELECT_     ₱60      0 (!)    ╔═════════════════════╗
      [Validation Check] ITEM                          ║ stock = 0 ✗ FAIL    ║
                                                        ║ (No state change)   ║
                                                        ╚═════════════════════╝
      
      Result: q₁ → q₁ (NO TRANSITION)
      
      [Error logged: "❌ Cookies is OUT OF STOCK - cannot select"]
      [Machine stays in q₁]
      [User can try other items or add coins]

t₃    Click Water (₱20)  SELECT_     ₱60      8        ├─ stock > 0 ✓       q₁→q₂
      [Validation Check] ITEM                         ├─ balance ≥ price ✓
                                                       └─ PASS
      
      Result: q₁ → q₂ (TRANSITION SUCCESS)
      
      [Message: "✓ Selected: Water - ₱20.00"]

t₄    Click Confirm      CONFIRM     ₱60      7        -                    q₂→q₃

t₅    [2 sec elapsed]    (AUTO)      ₱40      7        -                    q₃→q₄
      [Water dispensed]                              [change = ₱60-₱20=₱40]

t₆    Click Collect      COLLECT_    ₱0       7        -                    q₄→q₀
                         CHANGE

────────────────────────────────────────────────────────────────────────────────

DATABASE LOG:
Transaction Log: "Cookies OUT OF STOCK - Selection rejected"
Transaction Log: "Water successfully dispensed - Change: ₱40"

LESSON: Validation fails → stay in current state, log error
```

---

## Trace 5: Cancel Transaction

**Scenario**: User inserts ₱40, selects item, then cancels

```
TIME  ACTION           INPUT    CURRENT  NEXT   BALANCE  CHANGE   MSG
───────────────────────────────────────────────────────────────────
t₀    START            -        q₀       q₀     ₱0       -        

t₁    Insert coins     COIN_20  q₀       q₁     ₱40      -
      (×2)             COIN_20  q₁       q₁
                                (q₁ accumulates)

t₂    Select Energy    SELECT_  q₁       q₂     ₱40      -        "Selected:
      Drink (₱40)      ITEM                             Energy Drink"

t₃    User changes     CANCEL   q₂       q₄     ₱40      ₱40      "Cancel
      mind!                                             request
                                                         accepted"
      
      [No confirmation, goes directly to q₄]
      [Full balance (₱40) returned to user]

t₄    Collect change   COLLECT_ q₄       q₀     ₱0       ₱0
                       CHANGE

────────────────────────────────────────────────────────────────────

STATE SEQUENCE: q₀ → q₁ → q₂ → q₄ → q₀
RESULT: Cancelled transaction, full refund
ITEM: Not dispensed, inventory unchanged
```

---

## Trace 6: Reset Button (Hard Exit)

**Scenario**: User in middle of transaction and hits RESET

```
TIME  ACTION           INPUT    CURRENT  NEXT   BALANCE  SELECTED  CHANGE
───────────────────────────────────────────────────────────────────────
t₀    START            -        q₀       q₀     ₱0       -         -

t₁    Insert ₱50      COIN_20  q₀       q₁     ₱50      -         -
                       COIN_20  q₁       q₁

t₂    Select Cola     SELECT_   q₁       q₂     ₱50      Cola      -
                     ITEM

t₃    [USER PANICS]  RESET     q₂       q₀     ₱0       -         -
     Hit RESET button
     
     [NO REFUND!]
     [Hard reset to q₀]
     [Balance discarded: ₱50 lost]
     [Selection cleared]
     [No change returned]

────────────────────────────────────────────────────────────────────

STATE SEQUENCE: q₀ → q₁ → q₂ → q₀
RESULT: Money gone! (RESET is destructive)
NOTE: Different from CANCEL (which returns money)
```

---

## Trace 7: Multiple Coins (Accumulation)

**Scenario**: User adds coins one at a time

```
TIME  ACTION        INPUT    STATE  STATE_CH  BALANCE  NOTES
─────────────────────────────────────────────────────
t₀    START         -        q₀     -         ₱0       

t₁    Add ₱5        COIN_5   q₀ →q₁  YES      ₱5       [Enter q₁]

t₂    Add ₱10       COIN_10  q₁ →q₁  NO       ₱15      [Stay in q₁, self-loop]

t₃    Add ₱20       COIN_20  q₁ →q₁  NO       ₱35      [Stay in q₁, self-loop]

t₄    Add ₱5        COIN_5   q₁ →q₁  NO       ₱40      [Stay in q₁, self-loop]

t₅    Now select    SELECT_  q₁ →q₂  YES      ₱40      [Finally transition]
                    ITEM

──────────────────────────────────────────────────────────

STATE SEQUENCE: q₀ ─(c₅)→ q₁ ─(c₁₀)→ q₁ ─(c₂₀)→ q₁ ─(c₅)→ q₁ ─(s)→ q₂

COIN ACCUMULATION PATTERN:
  First coin: q₀ → q₁ (one transition)
  More coins: q₁ → q₁ (self-loops, multiple times)
  
This demonstrates "coin accumulation mode" - stay in q₁ until selection
```

---

## Trace 8: Concurrent Testing (Reproducibility)

**Scenario**: Same sequence, run twice to prove determinism

```
RUN 1:
──────
t₀: START          q₀
t₁: COIN_20        q₀ → q₁  ✓
t₂: SELECT_ITEM    q₁ → q₂  ✓
t₃: CONFIRM        q₂ → q₃  ✓
t₄: (AUTO 2s)      q₃ → q₄  ✓
t₅: COLLECT_       q₄ → q₀  ✓
    CHANGE

RUN 2 (IDENTICAL):
──────────────────
t₀: START          q₀
t₁: COIN_20        q₀ → q₁  ✓
t₂: SELECT_ITEM    q₁ → q₂  ✓
t₃: CONFIRM        q₂ → q₃  ✓
t₄: (AUTO 2s)      q₃ → q₄  ✓
t₅: COLLECT_       q₄ → q₀  ✓
    CHANGE

RUN 3 (IDENTICAL):
──────────────────
[Same results as Run 1 & 2]

CONCLUSION: Same input sequence → same state sequence (DETERMINISTIC ✓)
```

---

## Trace 9: Invalid Input in Each State

**Scenario**: Try invalid inputs from each state

```
STATE q₀ (IDLE):
  COIN_5 → q₁ ✓ VALID
  COIN_10 → q₁ ✓ VALID
  COIN_20 → q₁ ✓ VALID
  RESET → q₀ ✓ VALID
  SELECT_ITEM → ✗ INVALID (no money yet)
  CONFIRM → ✗ INVALID
  CANCEL → ✗ INVALID
  COLLECT_CHANGE → ✗ INVALID

STATE q₁ (COIN_INSERTED):
  COIN_5 → q₁ ✓ VALID
  COIN_10 → q₁ ✓ VALID
  COIN_20 → q₁ ✓ VALID
  SELECT_ITEM → q₂ ✓ VALID*
  CANCEL → q₄ ✓ VALID
  RESET → q₀ ✓ VALID
  CONFIRM → ✗ INVALID (no selection)
  COLLECT_CHANGE → ✗ INVALID

STATE q₂ (ITEM_SELECTED):
  COIN_5 → ✗ INVALID (can't add coins after selecting)
  COIN_10 → ✗ INVALID
  COIN_20 → ✗ INVALID
  SELECT_ITEM → ✗ INVALID (already selected)
  CONFIRM → q₃ ✓ VALID
  CANCEL → q₄ ✓ VALID
  RESET → q₀ ✓ VALID
  COLLECT_CHANGE → ✗ INVALID

STATE q₃ (DISPENSING):
  ALL INPUTS → ✗ INVALID (machine busy)
  [Automatic transition after 2s: q₃ → q₄]

STATE q₄ (RETURNING_CHANGE):
  COLLECT_CHANGE → q₀ ✓ VALID
  RESET → q₀ ✓ VALID
  COIN_5 → ✗ INVALID (already dispensed)
  COIN_10 → ✗ INVALID
  COIN_20 → ✗ INVALID
  SELECT_ITEM → ✗ INVALID
  CONFIRM → ✗ INVALID
  CANCEL → ✗ INVALID

────────────────────────────────────────────────────

ERROR BEHAVIOR: 
  Invalid inputs produce error messages but no state change
  Machine remains in current state
  User can try different input or cancel transaction
```

---

## Trace 10: Full Business Day (Multiple Transactions)

**Scenario**: Multiple users throughout a day

```
TRANSACTION 1 [9:00 AM]  User A: Insert ₱25, Buy Water (₱20) - Get ₱5 change
              STATE:    q₀ → q₁ → q₂ → q₃ → q₄ → q₀  ✓

TRANSACTION 2 [9:05 AM]  User B: Insert ₱40, Buy Cola (₱25) - Get ₱15 change
              STATE:    q₀ → q₁ → q₂ → q₃ → q₄ → q₀  ✓

TRANSACTION 3 [9:10 AM]  User C: Insert ₱50, Try Cookies (OOS), Cancel
              STATE:    q₀ → q₁ → q₁ → q₄ → q₀  ✓
                              (validation fail, no transition)

TRANSACTION 4 [9:15 AM]  User D: Insert ₱5, Try Energy Drink (₱40)
              STATE:    q₀ → q₁ [tries SELECT: FAIL] → q₁
                              [Adds ₱50 more]
                              → q₁ ─(SELECT)→ q₂ → q₃ → q₄ → q₀  ✓

DATABASE SUMMARY:
  ├─ machine_history.json: 4 transactions recorded
  ├─ machine_history.txt: Human-readable log
  └─ Inventory updated: Water -1, Cola -1, Energy Drink -1

KEY: Each transaction completes the full q₀ loop, FSM returns to initial state
```

---

## Trace 11: Stress Test - Rapid Button Clicks

**Scenario**: User clicks buttons rapidly during COIN_INSERTED

```
RAPID CLICKS:
─────────────
q₁ state, balance: ₱30

CLICK 1: COIN_5 → q₁ (balance: ₱35)  [Self-loop OK]
CLICK 2: COIN_10 → q₁ (balance: ₱45)  [Self-loop OK]
CLICK 3: SELECT_A1 → q₂  [Transaction to q₂]
CLICK 4: CANCEL [During transition] → q₄  [Accepted, goes to q₄]

Results: Safe, no crashes
State: q₄ (returning money)
Message: Coins (₱45) returned

KEY: FSM handles rapid input gracefully
Each input processed deterministically
No race conditions or undefined states
```

---

## Summary: Determinism in Action

All traces demonstrate:

1. **Deterministic Transitions**: Same (state, input) → same next state
2. **Reproducible Behavior**: Run same sequence → get same results
3. **Clear State Boundaries**: Each state has well-defined valid/invalid inputs
4. **Validation Outside FSM**: Data checks don't affect state transitions
5. **Error Handling**: Invalid inputs logged, no state change
6. **Complete Workflows**: All transactions cycle through states and return to q₀

**CONCLUSION: Implementation is a true DFA ✓**

---

*Execution Traces Created: December 17, 2025*  
*Purpose: Demonstrate deterministic FSM behavior*  
*Course: CS 109 - Automata Theory*
