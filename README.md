# Vending Machine Simulator - Deterministic Finite Automaton (DFA) with Database Logging

A true Deterministic Finite Automaton implementation of a vending machine with database history logging in JSON and text formats.

## 🎓 Academic Context

This project implements a formal DFA as defined in automata theory:
- **Definition**: M = (Q, Σ, δ, q₀, F)
- **States (Q)**: 5 deterministic states
- **Input Alphabet (Σ)**: 8 context-specific symbols
- **Transition Function (δ)**: Table-driven deterministic lookups
- **Initial State (q₀)**: IDLE
- **Accepting States (F)**: IDLE

See [DFA_SPECIFICATION.md](DFA_SPECIFICATION.md) and [DFA_STATE_DIAGRAM.md](DFA_STATE_DIAGRAM.md) for formal definitions.

## Features

- **DFA States** (5): IDLE → COIN_INSERTED → ITEM_SELECTED → DISPENSING → RETURNING_CHANGE → IDLE
- **Input Symbols** (8): COIN_5, COIN_10, COIN_20, SELECT_ITEM, CONFIRM, CANCEL, RESET, COLLECT_CHANGE
- **Determinism**: Each (state, input) pair has exactly ONE next state
- **Validation**: Data checks happen outside FSM (don't change state, log errors)
- **Coin denominations**: ₱5, ₱10, ₱20
- **Product prices**: ₱20–₱40 range (9 products)
- **Database logging**: Automatic persistence of transactions, state transitions, and events
- **History export**: View and download transaction history as JSON

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `body-parser` - JSON request parsing

### 2. Start the Server

```bash
npm start
```

Or manually:

```bash
node server.js
```

You should see:
```
✓ Vending Machine Server running on http://localhost:3000
✓ Database: data/
✓ JSON: data/machine_history.json
✓ Text: data/machine_history.txt
```

### 3. Open the Simulator

Open `index.html` in your browser (or navigate to `http://localhost:3000`).

## Database Files

The server creates a `data/` folder with:

- **`machine_history.json`**: Structured transaction data
  ```json
  {
    "transactions": [
      {
        "type": "STATE_TRANSITION",
        "previousState": "IDLE",
        "currentState": "COIN_INSERTED",
        "balance": 5.0,
        "timestamp": "2025-12-17T10:30:45.123Z"
      },
      {
        "type": "TRANSACTION",
        "itemName": "Cola",
        "price": 25.0,
        "paid": 30.0,
        "change": 5.0,
        "timestamp": "2025-12-17T10:31:20.456Z"
      }
    ],
    "startTime": "2025-12-17T10:30:00.000Z"
  }
  ```

- **`machine_history.txt`**: Human-readable log
  ```
  === VENDING MACHINE HISTORY ===
  Started: 2025-12-17T10:30:00.000Z
  ==================================================

  [2025-12-17T10:30:45.123Z] [STATE] IDLE → COIN_INSERTED | Balance: ₱5.00
  [2025-12-17T10:31:20.456Z] [LOG] Selected: Cola - ₱25.00
  [2025-12-17T10:31:25.789Z] [TRANSACTION] {"itemName":"Cola","price":25.0,"paid":30.0,"change":5.0,...}
  ```

## API Endpoints

### `POST /api/transaction`
Save a completed transaction.
```json
{
  "itemName": "Cola",
  "price": 25.0,
  "paid": 30.0,
  "change": 5.0
}
```

### `POST /api/state`
Save a state transition.
```json
{
  "previousState": "COIN_INSERTED",
  "currentState": "ITEM_SELECTED",
  "balance": 25.0,
  "selectedItem": "Cola"
}
```

### `POST /api/log`
Save a log event.
```json
{
  "message": "Selected: Cola - ₱25.00"
}
```

### `GET /api/history`
Retrieve all transactions as JSON.

### `GET /api/history/text`
Retrieve human-readable text log.

### `POST /api/history/clear`
Clear all history and reset database.

### `GET /api/health`
Health check endpoint.

## Usage

1. **Insert coins** - Click ₱5, ₱10, or ₱20 buttons
2. **Select product** - Click any available product
3. **Confirm purchase** - Click "Confirm Purchase" button
4. **Collect change** - Click "Collect Change" if applicable
5. **View history** - Click "View History" button to see transactions
6. **Export history** - A JSON file downloads automatically
7. **Clear history** - Click "Clear History" to reset database

## File Structure

```
vendingMachine/
├── index.html                    # Main UI with DFA implementation
├── styles.css                    # Styling (custom color palette)
├── server.js                     # Express server & API
├── package.json                  # Dependencies
├── README.md                     # This file
├── DFA_SPECIFICATION.md          # Formal DFA definition (Q, Σ, δ, q₀, F)
├── DFA_STATE_DIAGRAM.md          # Visual state diagrams & transitions
└── data/                         # Created automatically
    ├── machine_history.json      # Structured transaction log
    └── machine_history.txt       # Human-readable log
```

## Understanding the DFA

### Key Concepts

**Determinism**: For every (state, input) pair, there is exactly ONE next state.

```
Example: 
  - (COIN_INSERTED, COIN_5) always → COIN_INSERTED
  - (COIN_INSERTED, CANCEL) always → RETURNING_CHANGE
  - No branching based on data values
```

**Validation Outside FSM**: Data checks (balance ≥ price, stock > 0) happen before transition:
```
  - If validation FAILS → No state change (error logged, user can retry)
  - If validation PASSES → Transition proceeds normally
  - This maintains FSM determinism
```

### State Flow

```
IDLE ─(coins)→ COIN_INSERTED ─(select)→ ITEM_SELECTED ─(confirm)→ DISPENSING ─(auto)→ RETURNING_CHANGE ─(collect)→ IDLE
       ↑                        ↑              ↑                                           ↑
       │──(cancel)─────────────┘              │                                           │
       │                                      │──(cancel)──────────────────────────────────┘
       │                                                   
       └─(reset)─────────────────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

**"Database offline" message?**
- Ensure the server is running: `npm start`
- Check that port 3000 is not in use

**History not saving?**
- Verify the `data/` folder has write permissions
- Check browser console for errors

**Transaction stuck in COIN_INSERTED?**
- This is correct behavior! If validation fails (insufficient funds or out of stock), 
  the machine stays in COIN_INSERTED and logs the error
- User can add more coins or select a different item
- This is how the DFA maintains determinism

**Port 3000 already in use?**
Edit `server.js` and change `const PORT = 3000;` to another port.

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON + Text file storage
- **Theory**: Finite State Machine (Automata)

---

**CS 109 Automata Theory Project** 🎓
