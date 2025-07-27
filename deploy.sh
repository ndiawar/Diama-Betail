#!/bin/bash

# 🚀 Script de déploiement DIAMA sur Render
# Usage: ./deploy.sh

echo "🐄 Déploiement DIAMA sur Render..."

# Vérifier que git est configuré
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erreur: Ce répertoire n'est pas un repository Git"
    exit 1
fi

# Vérifier que tous les fichiers sont commités
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Attention: Il y a des modifications non commitées"
    echo "Voulez-vous les commiter maintenant? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git add .
        git commit -m "Auto-commit before deployment"
    else
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

# Vérifier que le remote est configuré
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Erreur: Aucun remote 'origin' configuré"
    echo "Configurez votre repository Git d'abord"
    exit 1
fi

# Pousser vers le repository
echo "📤 Poussage vers le repository..."
git push origin main

echo "✅ Déploiement initié!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Allez sur https://render.com"
echo "2. Créez un nouveau 'Blueprint'"
echo "3. Connectez votre repository"
echo "4. Render détectera automatiquement render.yaml"
echo ""
echo "🌐 URLs après déploiement:"
echo "- Backend: https://diama-backend.onrender.com"
echo "- Frontend: https://diama-frontend.onrender.com"
echo ""
echo "⏱️  Temps de déploiement: 5-10 minutes" 