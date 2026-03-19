const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');

router.get('/recent', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM food ORDER BY food_id DESC LIMIT 5'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search', authMiddleware, async (req, res) => {
    const { q } = req.query;
    try {
        const [rows] = await db.query(
            'SELECT * FROM food WHERE name LIKE ? LIMIT 10',
            [`%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;