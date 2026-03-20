# ONESKY Backend (Express + Prisma)

## Prerequis
- Node.js
- PostgreSQL (port `5432` par defaut)
- npm

## 1) Variables d'environnement
Le backend lit ses variables depuis `backend/.env`.

Variables utilisees :
- `DATABASE_URL` : URL de connexion PostgreSQL (utilisee par Prisma)
- `JWT_SECRET` : secret JWT pour les acces admin/portail
- `REFRESH_TOKEN_SECRET` : secret JWT refresh (optionnel, fallback si absent)
- `PORT` : port du backend (optionnel, default `5000`)
- `NODE_ENV` : `production` ou `development` (optionnel)
- `CORS_ORIGINS` : liste d'origines autorisees en dev (optionnel)
- SMTP (optionnel, pour l'envoi d'emails) :
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Exemple :
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onesky_db?schema=public"
JWT_SECRET="onesky-super-secret-key"
REFRESH_TOKEN_SECRET="refresh-secret"
PORT=5000

# Dev: autoriser le frontend sur plusieurs ports
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"

# Emails (SMTP) - optionnel
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="pass"
SMTP_FROM="noreply@onesky.space"
```

## 2) Installation
```powershell
cd backend
npm install
```

## 3) Base de donnees (migrations)
```powershell
npx prisma migrate dev --name init
```

## 4) Seeds (donnees primaires)
Les seeds initialisent l'admin et le contenu de base (pages/sections/produits).

1. Seed admin :
```powershell
node src/scripts/seedAdmin.js
```

2. Seed contenu :
```powershell
node src/scripts/seedContent.js
```

Important :
- `seedContent.js` fait un `deleteMany` sur `Section` avant de recreer le contenu. Si tu as des modifications en base, attention.

Identifiants admin (issus des seeds) :
- Email : `admin@onesky.com`
- Mot de passe : `Admin@2026!`

## 5) Lancer le backend
```powershell
npm run dev
```
Le backend ecoute sur `http://localhost:5000`.

## 6) Temps reel (notifications admin)
Le backend expose un flux SSE admin :
- `GET /api/messages/stream?token=...`

Il permet de declencher un toast en admin lorsqu'un nouveau message de contact est cree.

