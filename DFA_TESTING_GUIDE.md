# DFA Testing Guide

## Test Procedures

Run these tests to verify the DFA implementation is working correctly.

---

## Test 1: Basic Coin Acceptance (IDLE → COIN_INSERTED)

**Objective**: Verify coins transition to COIN_INSERTED state

**Steps**:
1. Start vending machine (should be in IDLE)
2. Click ₱5 button
3. Verify balance shows ₱5.00
4. Click ₱10 button
5. Verify balance shows ₱15.00
6. Click ₱20 button
7. Verify balance shows ₱35.00

**Expected DFA Transitions**:
```
q₀ ─(c₅)→ q₁ ─(c₁₀)→ q₁ ─(c₂₀)→ q₁
```

**Pass Criteria**:
- ✓ All coin inputs accepted in IDLE
- ✓ All coin inputs accepted in COIN_INSERTED
- ✓ Balance accumulates correctly
- ✓ Coin button remains enabled while in COIN_INSERTED

---

## Test 2: Item Selection with Sufficient Funds (COIN_INSERTED → ITEM_SELECTED)

**Objective**: Verify item selection transitions to ITEM_SELECTED when funds sufficient

**Steps**:
1. Insert ₱40 (two ₱20 coins)
2. Click on "Cola (₱25)" product
3. Verify display shows "Selected: Cola - ₱25.00"
4. Verify "Confirm" button is now enabled

**Expected DFA Transitions**:
```
q₀ ─(c₂₀)→ q₁ ─(c₂₀)→ q₁ ─(s)→ q₂
```

**Pass Criteria**:
- ✓ SELECT_ITEM transitions to ITEM_SELECTED
- ✓ Selected product displayed
- ✓ Confirm button enabled
- ✓ Coin buttons disabled (in q₂)

---

## Test 3: Item Selection with Insufficient Funds (COIN_INSERTED stays)

**Objective**: Verify insufficient funds does NOT change state

**Steps**:
1. Insert ₱5 (one ₱5 coin)
2. Click on "Cola (₱25)" product
3. Verify error message: "❌ INSUFFICIENT FUNDS: Need ₱20 more for Cola"
4. Verify machine still in COIN_INSERTED (coin buttons still active)
5. Add ₱20 (click ₱20 coin button)
6. Now click Cola again
7. Verify it transitions to ITEM_SELECTED

**Expected DFA Transitions**:
```
q₀ ─(c₅)→ q₁ [invalid s, stay] ─(c₂₀)→ q₁ ─(s)→ q₂
```

**Key Test**: Step 3 shows that SELECT_ITEM with insufficient funds does NOT transition
- This proves the DFA doesn't have data-dependent branching
- Instead, validation happens outside FSM

**Pass Criteria**:
- ✓ Invalid SELECT_ITEM does NOT change state
- ✓ Error logged (visible in UI or console)
- ✓ Coin buttons remain enabled (still in q₁)
- ✓ User can add more coins and retry
- ✓ When funds sufficient, SELECT_ITEM succeeds

---

## Test 4: Out of Stock Item (COIN_INSERTED stays)

**Objective**: Verify out-of-stock items don't change state

**Steps**:
1. Insert ₱50 (₱20 + ₱20 + ₱10)
2. Click on "Cookies (₱28)" product
3. Verify error message: "❌ Cookies is OUT OF STOCK - cannot select"
4. Verify machine still in COIN_INSERTED
5. Click on "Water (₱20)" product (which IS in stock)
6. Verify it transitions to ITEM_SELECTED

**Expected DFA Transitions**:
```
q₀ ─coins→ q₁ [invalid s(cookies), stay] → q₁ ─(s(water))→ q₂
```

**Pass Criteria**:
- ✓ Out-of-stock SELECT_ITEM does NOT change state
- ✓ Error message shown
- ✓ Machine remains in COIN_INSERTED
- ✓ User can select another item

---

## Test 5: Purchase Confirmation (ITEM_SELECTED → DISPENSING → RETURNING_CHANGE)

**Objective**: Verify complete purchase flow

**Steps**:
1. Insert ₱40 (two ₱20 coins)
2. Select "Water (₱20)"
3. Verify state: ITEM_SELECTED, Confirm button enabled
4. Click "Confirm" button
5. Verify animation and "💧 Dispensing Water..."
6. Verify after 2 seconds, automatic transition to "Collect Change"
7. Verify change = ₱40 - ₱20 = ₱20
8. Click "Collect Change"
9. Verify "💰 Returned: ₱20.00"
10. Verify machine back to IDLE (balance = ₱0)

**Expected DFA Transitions**:
```
q₁ ─(s)→ q₂ ─(k)→ q₃ [auto, 2s] → q₄ ─(g)→ q₀
```

**Pass Criteria**:
- ✓ CONFIRM transitions to DISPENSING
- ✓ Dispensing animation shows (2 seconds)
- ✓ Automatic transition to RETURNING_CHANGE after 2s
- ✓ Change calculated correctly (amount = balance - price)
- ✓ COLLECT_CHANGE transitions to IDLE
- ✓ Machine accepts new coins (back in IDLE)

---

## Test 6: Zero Change Scenario (₱20 coin → ₱20 item)

**Objective**: Verify correct change when balance equals price

**Steps**:
1. Insert ₱20
2. Select "Water (₱20)"
3. Confirm
4. Wait for dispensing
5. Verify change = ₱0
6. Verify message: "💰 Returned: ₱0.00" or similar
7. Click Collect Change
8. Verify back to IDLE

**Expected Behavior**:
- ✓ Calculates change = ₱20 - ₱20 = ₱0 correctly
- ✓ Still transitions through RETURNING_CHANGE state
- ✓ Still requires COLLECT_CHANGE button click to complete

---

## Test 7: Purchase with Change (₱30 coin → ₱25 item)

**Objective**: Verify partial payment scenario

**Steps**:
1. Insert ₱30 (₱20 + ₱10)
2. Select "Cola (₱25)"
3. Confirm
4. Wait for dispensing
5. Verify change = ₱30 - ₱25 = ₱5
6. Verify message: "💰 Returned: ₱5.00"
7. Click Collect Change
8. Verify machine ready for next transaction

**Pass Criteria**:
- ✓ Change = ₱5 calculated correctly
- ✓ Correct currency display (₱)
- ✓ All transitions work with non-zero change

---

## Test 8: Cancel Transaction (COIN_INSERTED → RETURNING_CHANGE → IDLE)

**Objective**: Verify cancel returns money and resets

**Steps**:
1. Insert ₱35 (₱20 + ₱10 + ₱5)
2. Click "Cancel" button
3. Verify transition to RETURNING_CHANGE
4. Verify change = ₱35 shown
5. Verify message: "💰 Returned: ₱35.00"
6. Click "Collect Change"
7. Verify machine back to IDLE (balance = ₱0)

**Expected DFA Transitions**:
```
q₀ ─coins→ q₁ ─(x)→ q₄ ─(g)→ q₀
```

**Pass Criteria**:
- ✓ CANCEL from COIN_INSERTED transitions to RETURNING_CHANGE
- ✓ Full balance returned
- ✓ State transitions correctly

---

## Test 9: Cancel from Item Selection (ITEM_SELECTED → RETURNING_CHANGE → IDLE)

**Objective**: Verify cancel after item selection

**Steps**:
1. Insert ₱30
2. Select "Diet Cola (₱24)"
3. Verify state: ITEM_SELECTED
4. Click "Cancel"
5. Verify transition to RETURNING_CHANGE
6. Verify change = ₱30 (full amount returned)
7. Click "Collect Change"
8. Verify back to IDLE

**Expected DFA Transitions**:
```
q₁ ─(s)→ q₂ ─(x)→ q₄ ─(g)→ q₀
```

**Pass Criteria**:
- ✓ CANCEL from ITEM_SELECTED transitions to RETURNING_CHANGE
- ✓ Full balance returned (selected item not charged)
- ✓ Inventory unchanged (item not dispensed)

---

## Test 10: Reset Button (Any state → IDLE)

**Objective**: Verify RESET from all states

**Steps**:

### Part A: Reset from IDLE
1. Machine in IDLE
2. Click "Reset"
3. Verify no change (already in IDLE)

### Part B: Reset from COIN_INSERTED
1. Insert ₱20
2. Click "Reset"
3. Verify machine in IDLE
4. Verify balance = ₱0 (coins discarded, NOT returned!)

### Part C: Reset from ITEM_SELECTED
1. Insert ₱30
2. Select item
3. Click "Reset"
4. Verify machine in IDLE
5. Verify balance = ₱0 (coins discarded)

### Part D: Reset from RETURNING_CHANGE
1. Insert ₱30
2. Click Cancel → RETURNING_CHANGE
3. Click "Reset" (instead of Collect Change)
4. Verify machine in IDLE
5. Verify balance = ₱0 (change discarded)

**Expected DFA Transitions**:
```
q₀ ─(r)→ q₀
q₁ ─(r)→ q₀
q₂ ─(r)→ q₀
q₄ ─(r)→ q₀
```

**Pass Criteria**:
- ✓ RESET from any state goes to IDLE
- ✓ Balance reset to ₱0
- ✓ Selected item cleared
- ✓ Change discarded (not returned to user)

---

## Test 11: Button State Verification (DFA Determinism)

**Objective**: Verify buttons enabled/disabled based on current state

| State | Coin Btns | Product Btns | Confirm | Cancel | Collect | Reset |
|-------|-----------|--------------|---------|--------|---------|-------|
| IDLE | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| COIN_INSERTED | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| ITEM_SELECTED | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| DISPENSING | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| RETURNING_CHANGE | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

**Steps**:
1. For each state, verify the button enable/disable pattern above
2. Try clicking disabled buttons (should have no effect)

---

## Test 12: Database Persistence

**Objective**: Verify transactions are logged

**Steps**:
1. Start server: `npm start`
2. Perform a complete purchase:
   - Insert ₱40
   - Select Cola (₱25)
   - Confirm
   - Collect change (₱15)
3. Check `data/machine_history.json`:
   ```json
   {
     "timestamp": "...",
     "item": "Cola",
     "price": 25,
     "paid": 40,
     "change": 15
   }
   ```
4. Check `data/machine_history.txt` for human-readable log

**Pass Criteria**:
- ✓ Transaction logged to JSON
- ✓ Transaction logged to text file
- ✓ Correct amounts recorded

---

## Test 13: Sequence Independence (Same input → same transition)

**Objective**: Verify true DFA determinism - same (state, input) always produces same result

**Test A**: From COIN_INSERTED, always accept coins
```
Session 1:
  q₀ ─(c₅)→ q₁ ─(c₅)→ q₁ ─(c₅)→ q₁
  Balance: ₱15

Session 2:
  q₀ ─(c₁₀)→ q₁ ─(c₅)→ q₁ ─(c₅)→ q₁
  After each step, verify same state
```

**Test B**: From COIN_INSERTED, SELECT_ITEM with insufficient funds never changes state
```
Try 5 times:
  1. Insert ₱5, click Cola (₱25) → stays in q₁, error logged ✓
  2. Insert ₱5, click Cola (₱25) → stays in q₁, error logged ✓
  3. Insert ₱5, click Cola (₱25) → stays in q₁, error logged ✓
  ...
```

**Pass Criteria**:
- ✓ Same (state, input) produces same next state every time
- ✓ No random behavior
- ✓ Reproducible transactions

---

## Test 14: Edge Case - Product Selection Spam

**Objective**: Verify rapid product selections don't crash FSM

**Steps**:
1. Insert ₱50
2. Rapidly click different products without confirming
3. Verify machine handles it gracefully
4. Verify current selected product updates correctly
5. Verify only the last selection is dispensed when Confirm clicked

**Pass Criteria**:
- ✓ No crashes or errors
- ✓ FSM remains in ITEM_SELECTED
- ✓ Selection correctly updates to most recent

---

## Test 15: Edge Case - Coin Button During Dispensing

**Objective**: Verify coin input ignored during DISPENSING state

**Steps**:
1. Insert ₱30
2. Select item, Confirm
3. During the 2-second dispensing animation, rapidly click coin buttons
4. Verify coin clicks are ignored
5. After dispensing completes, verify balance unchanged

**Pass Criteria**:
- ✓ No invalid transitions during DISPENSING
- ✓ Balance not affected by clicks during dispensing
- ✓ Machine remains in DISPENSING state

---

## Summary: DFA Properties Verified

After passing all 15 tests, you have verified:

1. ✓ **5 Distinct States**: IDLE, COIN_INSERTED, ITEM_SELECTED, DISPENSING, RETURNING_CHANGE
2. ✓ **8 Input Symbols**: COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL, RESET, COLLECT_CHANGE
3. ✓ **Deterministic Transitions**: Same (state, input) always → same next state
4. ✓ **Complete Transition Table**: All valid transitions work correctly
5. ✓ **Data Validation Outside FSM**: Insufficient funds/stock don't change state
6. ✓ **Accepting State**: IDLE is the natural ending/beginning state
7. ✓ **No Nondeterminism**: No branch points based on data values
8. ✓ **Persistence**: All transactions logged correctly

---

**DFA Verification Complete!** ✓

Your vending machine is a true Deterministic Finite Automaton.
