# NutriTrack Cloud

Application de suivi nutritionnel — Vue.js + Node.js + MySQL

## Fonctionnalités

- Authentification (inscription, connexion, JWT)
- Profil utilisateur (objectifs calories/macros)
- Suivi du poids avec graphique
- Journal alimentaire par repas
- Statistiques (graphiques calories/macros)

## Technologies

| Frontend | Backend | Base de données |
|----------|---------|-----------------|
| Vue.js 3 | Node.js / Express | MySQL |
| Vite | JWT / bcrypt | |
| Chart.js | Multer (uploads) | |

## Architecture

```
Frontend (Vue.js)  →  API REST (Express)  →  MySQL
    :5173                 :3000               :3306
```

## Modèle de données

Le model de donnée n'est plus exactement à jour. Quelques modifications ont été réalisé au cours du projet.

<img width="1235" height="439" alt="SCR-20260205-kwiw" src="https://github.com/user-attachments/assets/52e7301d-3c71-47df-8aa8-96eab6e0d861" />

<img width="1128" height="570" alt="SCR-20260205-laoy" src="https://github.com/user-attachments/assets/68f210fc-38c2-413c-9434-067f56529c95" />

## Installation

```bash
# Backend
cd backend
npm install
# Créer .env avec : PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## API principales

| Route | Description |
|-------|-------------|
| POST `/api/auth/login` | Connexion |
| GET/PUT `/api/profile` | Profil utilisateur |
| GET/POST `/api/weight` | Suivi du poids |
| GET/POST `/api/food` | Gestion aliments |
| GET/POST `/api/mealentry` | Journal alimentaire |
| GET `/api/mealentry/history` | Données graphiques |
