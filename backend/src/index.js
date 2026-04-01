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

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin)) {
            return callback(null, true);
        }
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