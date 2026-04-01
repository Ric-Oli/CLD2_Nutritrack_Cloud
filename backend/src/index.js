const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    /\.vercel\.app$/  // Autorise tous les sous-domaines vercel.app
].filter(Boolean);

const app = express();

// CORS: accepte localhost, l'URL Vercel principale, et tous les previews Vercel
app.use(cors({
    origin: (origin, callback) => {
        // Pas d'origin (ex: Postman) → OK
        if (!origin) return callback(null, true);

        // Localhost → OK
        if (origin.includes('localhost')) return callback(null, true);

        // Vercel (tous les sous-domaines) → OK
        if (origin.endsWith('.vercel.app')) return callback(null, true);

        // FRONTEND_URL exact → OK
        if (origin === process.env.FRONTEND_URL) return callback(null, true);

        // Sinon → refusé
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/weight', require('./routes/weightRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/mealentry', require('./routes/mealEntryRoutes'));

app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});