const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');
const upload = require('../middleware/uploadMiddleware');

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

// ← nouvelles routes

router.get('/recent', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM food ORDER BY food_id DESC LIMIT 5');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search', authMiddleware, async (req, res) => {
    const { q } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM food WHERE name LIKE ? LIMIT 10', [`%${q}%`]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM food ORDER BY food_id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', upload.single('image'), authMiddleware, async (req, res) => {
    const { name, calories, proteins, carbohydrates, lipids } = req.body;
    const userId = req.user.id;
    const imagePath = req.file ? req.file.filename : null;

    if (!name) return res.status(400).json({ message: 'Le nom est obligatoire' });

    try {
        const [result] = await db.query(
            'INSERT INTO food (name, calories, proteins, carbohydrates, lipids, user_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, userId, imagePath]
        );
        res.status(201).json({ message: 'Aliment créé avec succès', food_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', upload.single('image'), authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, calories, proteins, carbohydrates, lipids } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    try {
        if (imagePath) {
            await db.query(
                'UPDATE food SET name=?, calories=?, proteins=?, carbohydrates=?, lipids=?, image=? WHERE food_id=?',
                [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, imagePath, id]
            );
        } else {
            await db.query(
                'UPDATE food SET name=?, calories=?, proteins=?, carbohydrates=?, lipids=? WHERE food_id=?',
                [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, id]
            );
        }
        res.json({ message: 'Aliment mis à jour' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM food WHERE food_id = ?', [id]);
        res.json({ message: 'Aliment supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;