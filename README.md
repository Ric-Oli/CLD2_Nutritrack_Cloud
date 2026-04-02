# NutriTrack Cloud

Application de suivi nutritionnel — Vue.js + Node.js + MySQL

## Fonctionnalités

- Authentification (inscription, connexion, JWT)
- Profil utilisateur (objectifs calories/macros)
- Suivi du poids avec graphique
- Journal alimentaire par repas
- Statistiques (graphiques calories/macros)

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

# Documentation Technique — NutriTrack Cloud

## 1. Vue d'ensemble

NutriTrack Cloud est une application web de suivi nutritionnel permettant aux utilisateurs de :
- Suivre leur consommation alimentaire quotidienne
- Enregistrer leur évolution de poids
- Visualiser leurs statistiques via des graphiques
- Définir des objectifs caloriques et macros

---

## 2. Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │    Services     │
│    (Vue.js)     │────▶│   (Express.js)  │────▶│    externes     │
│    Vercel       │     │     Render      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        ▼
                        ┌─────────────┐          ┌─────────────┐
                        │   MySQL     │          │ Cloudinary  │
                        │ TiDB Cloud  │          │  (Images)   │
                        └─────────────┘          └─────────────┘
```

### Stack technique

| Couche | Technologie | Hébergement |
|--------|-------------|-------------|
| Frontend | Vue.js 3 + Vite | Vercel (gratuit) |
| Backend | Node.js + Express | Render (gratuit) |
| Base de données | MySQL | TiDB Cloud (gratuit) |
| Stockage images | Cloudinary | Cloudinary (gratuit) |

---

## 3. Structure du projet

```
nutritrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Connexion MySQL avec SSL
│   │   │   └── cloudinary.js    # Config Cloudinary
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── profileController.js
│   │   │   ├── weightController.js
│   │   │   └── foodController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # Vérification JWT
│   │   │   └── uploadMiddleware.js  # Multer pour images
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   ├── weightRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── mealRoutes.js
│   │   │   └── mealEntryRoutes.js
│   │   └── index.js             # Point d'entrée Express
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── views/
    │   │   ├── HomeView.vue      # Journal alimentaire
    │   │   ├── LoginView.vue     # Connexion/Inscription
    │   │   ├── ProfileView.vue   # Profil & objectifs
    │   │   ├── WeightView.vue    # Suivi du poids
    │   │   ├── FoodView.vue      # Gestion aliments
    │   │   └── StatsView.vue     # Graphiques
    │   ├── components/
    │   │   ├── Calendar.vue
    │   │   └── ProgressionMacrosCards.vue
    │   ├── router/index.js       # Routes Vue Router
    │   ├── api.js                # Helper URL API
    │   └── App.vue
    ├── package.json
    └── .env.example
```

---

## 4. Fonctionnement du code

### 4.1 Authentification (JWT)

**Flux de connexion :**
1. L'utilisateur envoie email + mot de passe
2. Le backend vérifie les credentials avec bcrypt
3. Si OK, génère un token JWT (valide 24h)
4. Le frontend stocke le token dans `localStorage`
5. Chaque requête envoie le token dans le header `Authorization`

```javascript
// Backend : Génération du token
const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });

// Frontend : Envoi du token
fetch(`${API_URL}/api/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Backend : Vérification du token (middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.id };
```

### 4.2 Upload d'images (Cloudinary)

**Flux d'upload :**
1. L'utilisateur sélectionne une image
2. Multer reçoit l'image en mémoire (buffer)
3. Le backend upload vers Cloudinary
4. Cloudinary retourne une URL HTTPS
5. L'URL est stockée dans la base de données

```javascript
// Upload vers Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'nutritrack/foods' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};
```

### 4.3 Calcul des macros

Les aliments sont stockés pour **100g**. Le calcul proportionnel se fait ainsi :

```javascript
// Pour une quantité X de grammes
const macros = {
  calories: (food.calories * quantity) / 100,
  proteins: (food.proteins * quantity) / 100,
  carbohydrates: (food.carbohydrates * quantity) / 100,
  lipids: (food.lipids * quantity) / 100,
};
```

### 4.4 API dynamique (Frontend)

Pour supporter dev et prod, l'URL de l'API est dynamique :

```javascript
// frontend/src/api.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http')) return image;  // URL Cloudinary
  return `${API_URL}/uploads/foods/${image}`;  // Fallback local
}
```

---

## 5. Base de données

### Schéma

```sql
user_ (user_id, lastname, firstname, email, password, height)
   │
   ├── goal (user_id, caloriesperday, macrosproteins, macroscarbohydrates, macroslipids)
   │
   ├── historical (historical_id, weight, date_, user_id)
   │
   ├── food (food_id, name, calories, proteins, carbohydrates, lipids, image, user_id)
   │
   └── mealentry (mealentry_id, day_, quantity, meal_id, user_id)
              │
              └── contient (mealentry_id, food_id)

meal (meal_id, mealtype)  -- Table statique : Petit-déjeuner, Déjeuner, Dîner, Collation
```

### Relations

- Un **utilisateur** a un **goal** (objectifs)
- Un **utilisateur** a plusieurs **historical** (poids)
- Un **utilisateur** a plusieurs **food** (aliments créés)
- Un **utilisateur** a plusieurs **mealentry** (entrées journal)
- Une **mealentry** est liée à un **meal** (type de repas)
- Une **mealentry** contient plusieurs **food** via la table **contient**

---

## 6. API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion → retourne JWT |

### Profil
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/profile` | Récupérer profil + objectifs |
| PUT | `/api/profile` | Modifier profil + objectifs |

### Poids
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/weight` | Liste des entrées de poids |
| POST | `/api/weight` | Ajouter une entrée |
| DELETE | `/api/weight/:id` | Supprimer une entrée |

### Aliments
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/food` | Liste des aliments |
| GET | `/api/food/recent` | 5 derniers aliments |
| GET | `/api/food/search?q=` | Rechercher un aliment |
| POST | `/api/food` | Créer un aliment (+ image) |
| PUT | `/api/food/:id` | Modifier un aliment |
| DELETE | `/api/food/:id` | Supprimer un aliment |

### Journal alimentaire
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/mealentry?date=` | Macros totales du jour |
| GET | `/api/mealentry/detail?date=` | Détail des entrées du jour |
| GET | `/api/mealentry/history?days=` | Historique pour graphiques |
| POST | `/api/mealentry` | Ajouter une entrée |
| PUT | `/api/mealentry/:id` | Modifier la quantité |
| DELETE | `/api/mealentry/:id` | Supprimer une entrée |

---

## 7. Sécurité

| Mesure | Implémentation |
|--------|----------------|
| Mots de passe | Hashés avec bcrypt (salt rounds: 10) |
| Authentification | JWT avec expiration 24h |
| CORS | Origines autorisées explicitement |
| SQL Injection | Requêtes préparées (paramètres `?`) |
| SSL/TLS | Connexion BDD chiffrée (TiDB Cloud) |
| Upload | Validation du type MIME (JPG, PNG, WEBP) |

---

## 8. Variables d'environnement

### Backend (.env)
```env
PORT=3000
FRONTEND_URL=https://cld-2-nutritrack-cloud-e1apzs6rv-ricardos-projects-a6500ea9.vercel.app

DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=xxx
DB_PASSWORD=xxx
DB_NAME=nutritrack
DB_SSL=true

JWT_SECRET=une_longue_chaine_secrete

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Frontend (.env)
```env
VITE_API_URL=https://cld2-nutritrack-cloud.onrender.com
```

