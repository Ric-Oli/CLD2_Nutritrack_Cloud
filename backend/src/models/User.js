const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM user_ WHERE email = ?', [email]);
        return rows[0];
    },

    async create(lastname, firstname, email, password) {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO user_ (lastname, firstname, email, password) VALUES (?, ?, ?, ?)',
            [lastname, firstname, email, hashed]
        );
        return result.insertId;
    },
};

module.exports = User;