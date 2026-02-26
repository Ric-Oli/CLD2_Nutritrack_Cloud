const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { lastname, firstname, email, password } = req.body;
    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

        await User.create(lastname, firstname, email, password);
        res.status(201).json({ message: 'Compte créé avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};