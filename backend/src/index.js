const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
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