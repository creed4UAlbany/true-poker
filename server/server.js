// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User'); 

const app = express();
const PORT = process.env.PORT || 8080; // Changed default to 8080 for App Engine

// --- FIX 1: DYNAMIC CORS ---
// This allows the server to accept requests from Localhost OR your Deployed App
app.use(cors({ 
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        callback(null, true);
    },
    credentials: true 
}));

app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Error:', err);
    }
};

// --- API ROUTES ---

// 1. READ USER
app.get('/api/users/:googleId', async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.googleId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. CREATE/LOGIN USER
app.post('/api/auth/login', async (req, res) => {
    const { googleId, email, displayName, photoURL } = req.body;
    try {
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, email, displayName, avatar: photoURL, chips: 1000 });
            await user.save();
            console.log("🆕 New User Created:", displayName);
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. TRANSACTION ROUTE
app.post('/api/users/:googleId/transaction', async (req, res) => {
    const { amount } = req.body;
    try {
        const user = await User.findOne({ googleId: req.params.googleId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.chips += amount;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. RESET CHIPS
app.put('/api/users/:googleId/reset', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { googleId: req.params.googleId },
            { chips: 1000 },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. DELETE USER
app.delete('/api/users/:googleId', async (req, res) => {
    try {
        await User.findOneAndDelete({ googleId: req.params.googleId });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- SERVE REACT FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

// Fix for "path-to-regexp" crash (Use Regex instead of string)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- START SERVER ---
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});