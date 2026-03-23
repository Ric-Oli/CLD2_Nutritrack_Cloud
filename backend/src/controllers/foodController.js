const db = require('../config/database');

exports.createFood = async (req, res) => {
    const { name, calories, proteins, carbohydrates, lipids } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Le nom est obligatoire' });

    try {
        const [result] = await db.query(
            'INSERT INTO food (name, calories, proteins, carbohydrates, lipids, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, calories || 0, proteins || 0, carbohydrates || 0, lipids || 0, userId]
        );
        res.status(201).json({ message: 'Aliment créé avec succès', food_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFoods = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM food ORDER BY food_id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteFood = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM food WHERE food_id = ?', [id]);
        res.json({ message: 'Aliment supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecentFoods = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM food ORDER BY food_id DESC LIMIT 5');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.searchFoods = async (req, res) => {
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
};