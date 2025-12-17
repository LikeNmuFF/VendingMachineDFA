# Vending Machine Simulator -DFA with Database Logging

A Finite State Machine implementation of a vending machine with database history logging in JSON and text formats.

## Features

- **FSM States**: IDLE, COIN_INSERTED, ITEM_SELECTED, DISPENSING, INSUFFICIENT_FUNDS, OUT_OF_STOCK, RETURNING_CHANGE
- **Coin denominations**: ₱5, ₱10, ₱20
- **Product prices**: ₱20–₱40 range
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
├── index.html              # Main UI
├── server.js               # Express server & API
├── package.json            # Dependencies
├── README.md              # This file
└── data/                  # Created automatically
    ├── machine_history.json
    └── machine_history.txt
```

## Troubleshooting

**"Database offline" message?**
- Ensure the server is running: `npm start`
- Check that port 3000 is not in use

**History not saving?**
- Verify the `data/` folder has write permissions
- Check browser console for errors

**Port 3000 already in use?**
Edit `server.js` and change `const PORT = 3000;` to another port.

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON + Text file storage
- **Theory**: Finite State Machine (Automata)

---

**CS 109 Automata Theory Project** 🎓
