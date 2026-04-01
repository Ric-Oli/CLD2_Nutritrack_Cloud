const db = require('../config/database');

exports.getWeights = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.query(
            'SELECT historical_id, weight, date_ FROM historical WHERE user_id = ? ORDER BY date_ ASC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addWeight = async (req, res) => {
    const userId = req.user.id;
    const { weight, date_ } = req.body;
    try {
        await db.query(
            'INSERT INTO historical (weight, date_, user_id) VALUES (?, ?, ?)',
            [weight, date_, userId]
        );
        res.status(201).json({ message: 'Poids ajouté avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteWeight = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        await db.query(
            'DELETE FROM historical WHERE historical_id = ? AND user_id = ?',
            [id, userId]
        );
        res.json({ message: 'Entrée supprimée' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};