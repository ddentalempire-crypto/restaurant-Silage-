const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, 'data');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(RESERVATIONS_FILE)) {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// Routes
app.post('/api/reserve', (req, res) => {
    const reservation = { ...req.body, timestamp: new Date().toISOString() };
    
    fs.readFile(RESERVATIONS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading reservations' });
        
        let reservations = [];
        try {
            reservations = JSON.parse(data);
        } catch (e) { reservations = []; }
        
        reservations.push(reservation);
        
        fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error saving reservation' });
            res.json({ success: true, message: 'Reservation confirmed!' });
        });
    });
});

app.post('/api/order', (req, res) => {
    const order = { ...req.body, timestamp: new Date().toISOString() };
    
    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading orders' });
        
        let orders = [];
        try {
            orders = JSON.parse(data);
        } catch (e) { orders = []; }
        
        orders.push(order);
        
        fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error saving order' });
            res.json({ success: true, message: 'Order received!' });
        });
    });
});

// Serve index.html for all other routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
