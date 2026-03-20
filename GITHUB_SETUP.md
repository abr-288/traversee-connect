# Instructions pour pousser le projet sur GitHub

## Étape 1: Créer un dépôt GitHub

1. Allez sur https://github.com et connectez-vous
2. Cliquez sur "+" → "New repository"
3. Nom du dépôt: `onesky-project`
4. Description: `OneSky - Plateforme web avec React frontend et Node.js backend`
5. Choisissez "Public" ou "Private"
6. NE cochez PAS "Add a README file" (nous en avons déjà un)
7. Cliquez sur "Create repository"

## Étape 2: Obtenir un token GitHub (si nécessaire)

Si vous utilisez l'authentification 2FA:
1. Allez dans GitHub Settings → Developer settings → Personal access tokens
2. Cliquez sur "Generate new token (classic)"
3. Donnez un nom au token (ex: "onesky-project")
4. Cochez "repo" (tous les droits de dépôt)
5. Générez le token et copiez-le (il ne sera plus affiché)

## Étape 3: Pousser le code

Exécutez ces commandes dans votre terminal:

```bash
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/onesky-project.git

# Si vous utilisez un token (remplacez TOKEN par votre token personnel)
git remote set-url origin https://TOKEN@github.com/VOTRE_USERNAME/onesky-project.git

# Pousser le code
git push -u origin main
```

## Étape 4: Vérifier

1. Allez sur votre page GitHub
2. Vous devriez voir tous les fichiers du projet
3. Le README.md devrait s'afficher correctement

## Structure du projet sur GitHub

```
onesky-project/
├── backend/                 # API Node.js
│   ├── src/
│   ├── prisma/
│   └── package.json
├── onesky/                  # Frontend React
│   ├── src/
│   ├── dist/
│   └── package.json
├── DEPLOYMENT_HOSTINGER.md  # Guide de déploiement
├── .env.example            # Variables d'environnement
└── hostinger-deploy.sh     # Script de déploiement
```

## Prochaines étapes

1. Configurez les variables d'environnement sur Hostinger
2. Suivez le guide DEPLOYMENT_HOSTINGER.md
3. Testez votre application en ligne

---

**Note**: N'oubliez pas de ne jamais committer de vrais mots de passe ou clés secrètes dans votre dépôt GitHub !
