const db = require('../config/database');

exports.updateProfile = async (req, res) => {
    const { height, caloriesperday, macrosproteins, macroscarbohydrates, macroslipids } = req.body;
    const userId = req.user.id;

    try {
        // Met à jour la taille dans user_
        await db.query('UPDATE user_ SET height = ? WHERE user_id = ?', [height, userId]);

        // Upsert sur la table goal (insert si n'existe pas, update sinon)
        await db.query(`
      INSERT INTO goal (user_id, caloriesperday, macrosproteins, macroscarbohydrates, macroslipids)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        caloriesperday = VALUES(caloriesperday),
        macrosproteins = VALUES(macrosproteins),
        macroscarbohydrates = VALUES(macroscarbohydrates),
        macroslipids = VALUES(macroslipids)
    `, [userId, caloriesperday, macrosproteins, macroscarbohydrates, macroslipids]);

        res.json({ message: 'Profil mis à jour' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};