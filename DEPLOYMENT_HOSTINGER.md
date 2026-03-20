# Guide de Déploiement sur Hostinger

## Architecture du Projet

- **Backend**: Node.js avec Express, Prisma ORM, PostgreSQL
- **Frontend**: React avec Vite, TypeScript, TailwindCSS
- **Base de données**: PostgreSQL

## Étapes de Déploiement

### 1. Préparation du Backend

#### 1.1 Configuration des variables d'environnement
Créez un fichier `.env` dans le dossier `backend/` :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=votre_jwt_secret
EMAIL_HOST=smtp.votreserveur.com
EMAIL_PORT=587
EMAIL_USER=votre_email@domaine.com
EMAIL_PASS=votre_mot_de_passe
```

#### 1.2 Build des dépendances
```bash
cd backend
npm install --production
npx prisma generate
npx prisma db deploy
```

### 2. Préparation du Frontend

#### 2.1 Build de l'application
```bash
cd onesky
npm install
npm run build
```

#### 2.2 Configuration de l'API
Modifiez `src/config/api.ts` pour pointer vers l'URL de votre backend sur Hostinger :

```typescript
export const API_BASE_URL = 'https://votredomaine.com/api';
```

### 3. Déploiement sur Hostinger

#### 3.1 Option 1: Hébergement Web Standard

1. **Uploader les fichiers** :
   - Connectez-vous à votre panel Hostinger
   - Allez dans "File Manager"
   - Uploadez le contenu du dossier `onesky/dist` dans `public_html/`
   - Créez un dossier `backend` dans `public_html/`
   - Uploadez le contenu du dossier `backend/` (sauf `node_modules`)

2. **Configuration Node.js** :
   - Allez dans "Setup" → "Node.js"
   - Sélectionnez la version Node.js compatible (v18+)
   - Pointez le "Application root" vers `public_html/backend`
   - "Application URL" : `https://votredomaine.com`
   - "Application startup file" : `src/server.js`

3. **Base de données** :
   - Créez une base de données PostgreSQL dans "Databases"
   - Importez votre schéma avec `npx prisma db push`
   - Mettez à jour le `DATABASE_URL` dans le fichier `.env`

#### 3.2 Option 2: Hébergement Cloud (VPS)

1. **Connexion au serveur** :
   ```bash
   ssh user@votre_ip
   ```

2. **Installation des dépendances** :
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql nginx
   ```

3. **Configuration de PostgreSQL** :
   ```bash
   sudo -u postgres createdb votredb
   sudo -u postgres createuser votreuser
   sudo -u postgres psql -c "ALTER USER votreuser PASSWORD 'votrepassword';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE votredb TO votreuser;"
   ```

4. **Déploiement de l'application** :
   ```bash
   git clone votre-repo
   cd onesky-project
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   cd ../onesky
   npm install
   npm run build
   ```

5. **Configuration PM2** :
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/server.js --name "onesky-backend"
   pm2 startup
   pm2 save
   ```

6. **Configuration Nginx** :
   ```nginx
   server {
       listen 80;
       server_name votredomaine.com;
       
       location / {
           root /path/to/onesky-project/onesky/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 4. Configuration du Domaine et SSL

1. **Domaine** :
   - Ajoutez votre domaine dans le panel Hostinger
   - Configurez les DNS si nécessaire

2. **SSL Certificate** :
   - Activez le SSL gratuit via Let's Encrypt
   - Redirigez HTTP vers HTTPS

### 5. Tests Post-Déploiement

1. **Vérifiez que le frontend est accessible**
2. **Testez les endpoints API**
3. **Vérifiez la connexion à la base de données**
4. **Testez l'authentification**

### 6. Monitoring et Maintenance

1. **Logs** : Vérifiez les logs d'erreur régulièrement
2. **Backups** : Configurez des backups automatiques de la base de données
3. **Mises à jour** : Maintenez les dépendances à jour

## Fichiers de Configuration Additionnels

### .htaccess (pour l'hébergement partagé)
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ backend/index.php [QSA,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### package.json (scripts de déploiement)
```json
{
  "scripts": {
    "deploy": "npm run build && rsync -av dist/ user@host:/path/to/public_html/",
    "deploy:backend": "cd backend && npm install && pm2 restart onesky-backend"
  }
}
```

## Dépannage

### Problèmes Communs

1. **Erreur 500** : Vérifiez les logs du serveur et les permissions de fichiers
2. **Base de données inaccessible** : Vérifiez le `DATABASE_URL` et les permissions
3. **CORS** : Configurez correctement les origines autorisées dans le backend
4. **Assets non trouvés** : Vérifiez la configuration du `base` dans `vite.config.ts`

### Support

- Documentation Hostinger : https://support.hostinger.com/
- Support technique : contact@hostinger.com

---

**Note importante** : Assurez-vous de ne jamais exposer vos clés secrètes (JWT_SECRET, mots de passe) dans le code source. Utilisez toujours les variables d'environnement.
