const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const jsonDbPath = path.join(dataDir, 'machine_history.json');
const textDbPath = path.join(dataDir, 'machine_history.txt');

// Initialize database files if they don't exist
function initializeDatabase() {
    if (!fs.existsSync(jsonDbPath)) {
        fs.writeFileSync(jsonDbPath, JSON.stringify({ transactions: [], startTime: new Date().toISOString() }, null, 2));
    }
    if (!fs.existsSync(textDbPath)) {
        fs.writeFileSync(textDbPath, `=== VENDING MACHINE HISTORY ===\nStarted: ${new Date().toISOString()}\n${'='.repeat(50)}\n\n`);
    }
}

initializeDatabase();

// Load JSON database
function loadJsonDatabase() {
    try {
        const data = fs.readFileSync(jsonDbPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { transactions: [], startTime: new Date().toISOString() };
    }
}

// Save JSON database
function saveJsonDatabase(data) {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
}

// Append to text database
function appendTextDatabase(entry) {
    fs.appendFileSync(textDbPath, entry + '\n');
}

// POST endpoint to save transaction
app.post('/api/transaction', (req, res) => {
    try {
        const transaction = req.body;
        
        if (!transaction) {
            return res.status(400).json({ error: 'No transaction data provided' });
        }

        const timestamp = new Date().toISOString();
        const txn = { ...transaction, timestamp };

        // Save to JSON
        const jsonData = loadJsonDatabase();
        jsonData.transactions.push(txn);
        saveJsonDatabase(jsonData);

        // Save to text file
        const textEntry = `[${timestamp}] ${JSON.stringify(txn)}`;
        appendTextDatabase(textEntry);

        res.json({ success: true, message: 'Transaction saved', timestamp });
    } catch (err) {
        console.error('Error saving transaction:', err);
        res.status(500).json({ error: 'Failed to save transaction', details: err.message });
    }
});

// POST endpoint to save state transition
app.post('/api/state', (req, res) => {
    try {
        const stateData = req.body;
        
        if (!stateData) {
            return res.status(400).json({ error: 'No state data provided' });
        }

        const timestamp = new Date().toISOString();
        const entry = { ...stateData, timestamp, type: 'STATE_TRANSITION' };

        // Save to JSON
        const jsonData = loadJsonDatabase();
        jsonData.transactions.push(entry);
        saveJsonDatabase(jsonData);

        // Save to text file
        const textEntry = `[${timestamp}] [STATE] ${stateData.previousState} → ${stateData.currentState} | Balance: ₱${stateData.balance.toFixed(2)}`;
        appendTextDatabase(textEntry);

        res.json({ success: true, message: 'State saved', timestamp });
    } catch (err) {
        console.error('Error saving state:', err);
        res.status(500).json({ error: 'Failed to save state', details: err.message });
    }
});

// POST endpoint to save log event
app.post('/api/log', (req, res) => {
    try {
        const logData = req.body;
        
        if (!logData || !logData.message) {
            return res.status(400).json({ error: 'No log message provided' });
        }

        const timestamp = new Date().toISOString();
        const entry = { ...logData, timestamp, type: 'LOG_EVENT' };

        // Save to JSON
        const jsonData = loadJsonDatabase();
        jsonData.transactions.push(entry);
        saveJsonDatabase(jsonData);

        // Save to text file
        const textEntry = `[${timestamp}] [LOG] ${logData.message}`;
        appendTextDatabase(textEntry);

        res.json({ success: true, message: 'Log saved', timestamp });
    } catch (err) {
        console.error('Error saving log:', err);
        res.status(500).json({ error: 'Failed to save log', details: err.message });
    }
});

// GET endpoint to retrieve history
app.get('/api/history', (req, res) => {
    try {
        const jsonData = loadJsonDatabase();
        res.json(jsonData);
    } catch (err) {
        console.error('Error retrieving history:', err);
        res.status(500).json({ error: 'Failed to retrieve history', details: err.message });
    }
});

// GET endpoint to retrieve text file
app.get('/api/history/text', (req, res) => {
    try {
        if (fs.existsSync(textDbPath)) {
            const data = fs.readFileSync(textDbPath, 'utf-8');
            res.type('text/plain').send(data);
        } else {
            res.status(404).json({ error: 'Text history file not found' });
        }
    } catch (err) {
        console.error('Error retrieving text history:', err);
        res.status(500).json({ error: 'Failed to retrieve text history', details: err.message });
    }
});

// GET endpoint to clear history
app.post('/api/history/clear', (req, res) => {
    try {
        initializeDatabase();
        
        res.json({ success: true, message: 'History cleared' });
    } catch (err) {
        console.error('Error clearing history:', err);
        res.status(500).json({ error: 'Failed to clear history', details: err.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
    console.log(`✓ Vending Machine Server running on http://localhost:${PORT}`);
    console.log(`✓ Database: ${dataDir}`);
    console.log(`✓ JSON: ${jsonDbPath}`);
    console.log(`✓ Text: ${textDbPath}`);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error(`Start the server with a different port, for example: PORT=3001 npm start`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});
