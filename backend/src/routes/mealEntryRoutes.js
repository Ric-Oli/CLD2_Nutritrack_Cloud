const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/database');

router.get('/', authMiddleware, async (req, res) => {
    const { date } = req.query;
    const userId = req.user.id;
    try {
        const [rows] = await db.query(`
            SELECT
                SUM(f.calories * me.quantity / 100) as calories,
                SUM(f.proteins * me.quantity / 100) as proteins,
                SUM(f.carbohydrates * me.quantity / 100) as carbohydrates,
                SUM(f.lipids * me.quantity / 100) as lipids
            FROM mealentry me
                     JOIN contient c ON me.mealentry_id = c.mealentry_id
                     JOIN food f ON c.food_id = f.food_id
            WHERE me.user_id = ? AND me.day_ = ?
        `, [userId, date]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { food_id, meal_id, quantity, date } = req.body;
    const userId = req.user.id;

    try {
        let [existing] = await db.query(
            'SELECT mealentry_id FROM mealentry WHERE user_id = ? AND meal_id = ? AND day_ = ?',
            [userId, meal_id, date]
        );

        let mealentryId;
        if (existing.length > 0) {
            mealentryId = existing[0].mealentry_id;
        } else {
            const [result] = await db.query(
                'INSERT INTO mealentry (day_, quantity, meal_id, user_id) VALUES (?, ?, ?, ?)',
                [date, quantity, meal_id, userId]
            );
            mealentryId = result.insertId;
        }

        await db.query(
            'INSERT INTO contient (mealentry_id, food_id) VALUES (?, ?)',
            [mealentryId, food_id]
        );

        await db.query(
            'UPDATE mealentry SET quantity = ? WHERE mealentry_id = ?',
            [quantity, mealentryId]
        );

        res.status(201).json({ message: 'Aliment ajouté avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Récupère les aliments consommés pour une date groupés par repas
router.get('/detail', authMiddleware, async (req, res) => {
    const { date } = req.query;
    const userId = req.user.id;
    try {
        const [rows] = await db.query(`
            SELECT 
                me.mealentry_id,
                me.quantity,
                m.meal_id,
                m.mealtype,
                f.food_id,
                f.name,
                f.image,
                f.calories,
                f.proteins,
                f.carbohydrates,
                f.lipids,
                ROUND(f.calories * me.quantity / 100, 1) as total_calories,
                ROUND(f.proteins * me.quantity / 100, 1) as total_proteins,
                ROUND(f.carbohydrates * me.quantity / 100, 1) as total_carbohydrates,
                ROUND(f.lipids * me.quantity / 100, 1) as total_lipids
            FROM mealentry me
            JOIN meal m ON me.meal_id = m.meal_id
            JOIN contient c ON me.mealentry_id = c.mealentry_id
            JOIN food f ON c.food_id = f.food_id
            WHERE me.user_id = ? AND me.day_ = ?
            ORDER BY m.meal_id
        `, [userId, date]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Historique des macros sur plusieurs jours (pour les graphiques)
router.get('/history', authMiddleware, async (req, res) => {
    const { days = 7 } = req.query;
    const userId = req.user.id;
    try {
        const [rows] = await db.query(`
            SELECT 
                me.day_ as date,
                ROUND(SUM(f.calories * me.quantity / 100), 1) as calories,
                ROUND(SUM(f.proteins * me.quantity / 100), 1) as proteins,
                ROUND(SUM(f.carbohydrates * me.quantity / 100), 1) as carbohydrates,
                ROUND(SUM(f.lipids * me.quantity / 100), 1) as lipids
            FROM mealentry me
            JOIN contient c ON me.mealentry_id = c.mealentry_id
            JOIN food f ON c.food_id = f.food_id
            WHERE me.user_id = ? 
              AND me.day_ >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY me.day_
            ORDER BY me.day_ ASC
        `, [userId, parseInt(days)]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Modifie la quantité d'une entrée
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await db.query(
            'UPDATE mealentry SET quantity = ? WHERE mealentry_id = ?',
            [quantity, id]
        );
        res.json({ message: 'Quantité mise à jour' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Supprime une entrée
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM contient WHERE mealentry_id = ?', [id]);
        await db.query('DELETE FROM mealentry WHERE mealentry_id = ?', [id]);
        res.json({ message: 'Entrée supprimée' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;