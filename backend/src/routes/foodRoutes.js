const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'nutritrack/foods' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

router.get('/recent', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.query(
            'SELECT * FROM food WHERE user_id = ? ORDER BY food_id DESC LIMIT 5',
            [userId]
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

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.query(
            'SELECT * FROM food WHERE user_id = ? ORDER BY food_id DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { name, calories, proteins, carbohydrates, lipids } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Le nom est obligatoire' });

    try {
        let imageUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const [result] = await db.query(
            'INSERT INTO food (name, calories, proteins, carbohydrates, lipids, user_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, userId, imageUrl]
        );
        res.status(201).json({ message: 'Aliment créé avec succès', food_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, calories, proteins, carbohydrates, lipids } = req.body;

    try {
        let imageUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        if (imageUrl) {
            await db.query(
                'UPDATE food SET name=?, calories=?, proteins=?, carbohydrates=?, lipids=?, image=? WHERE food_id=?',
                [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, imageUrl, id]
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