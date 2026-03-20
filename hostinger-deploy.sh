#!/bin/bash

# Script de déploiement pour Hostinger
# Usage: ./hostinger-deploy.sh

echo "🚀 Début du déploiement sur Hostinger..."

# Variables de configuration
BACKEND_DIR="backend"
FRONTEND_DIR="onesky"
BUILD_DIR="dist"

# 1. Build du frontend
echo "📦 Build du frontend..."
cd $FRONTEND_DIR
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi

echo "✅ Frontend build terminé"

# 2. Préparation du backend
echo "🔧 Préparation du backend..."
cd ../$BACKEND_DIR

# Installation des dépendances production
npm ci --production

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances backend"
    exit 1
fi

# Génération du client Prisma
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la génération Prisma"
    exit 1
fi

echo "✅ Backend prêt"

# 3. Création de l'archive de déploiement
echo "📁 Création de l'archive..."
cd ..
tar -czf onesky-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=$FRONTEND_DIR/node_modules \
    --exclude=$FRONTEND_DIR/.git \
    --exclude=$BACKEND_DIR/node_modules \
    --exclude=$BACKEND_DIR/.git \
    $FRONTEND_DIR/$BUILD_DIR/ \
    $BACKEND_DIR/

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la création de l'archive"
    exit 1
fi

echo "✅ Archive créée: onesky-deploy.tar.gz"

# 4. Instructions pour l'upload
echo ""
echo "📋 Étapes suivantes :"
echo "1. Connectez-vous à votre panel Hostinger"
echo "2. Allez dans le File Manager"
echo "3. Uploadez le fichier 'onesky-deploy.tar.gz'"
echo "4. Extrayez l'archive dans le répertoire principal"
echo "5. Configurez les variables d'environnement (.env)"
echo "6. Exécutez 'npx prisma db push' pour initialiser la base de données"
echo "7. Redémarrez le serveur Node.js via le panel Hostinger"
echo ""
echo "🎉 Déploiement préparé avec succès !"
