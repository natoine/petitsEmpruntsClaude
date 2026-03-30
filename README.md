# PetitsEmpruntsClaude — CLAUDE.md

## Description du projet
Application de prêt entre particuliers (web + mobile).
Permet à des utilisateurs de proposer ou demander des prêts entre eux.
Par ex : je te prête le tome 15 de la BD Thorgal, j'aimerai bien savoir que c'est toi qui l'as et te le rappeler un jour.

## Stack technique
- **Serveur** : Node.js + Express
- **Base de données** : MongoDB (Mongoose)
- **Hébergement serveur** : Scalingo
- **Frontend web** : Svelte / SvelteKit
- **Mobile** : à définir (probablement Capacitor sur SvelteKit)

## Structure du projet
```
PetitsEmprunts/
├── CLAUDE.md
├── server/          ← API REST Node.js
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── app.js
│   ├── Procfile     ← pour Scalingo
│   └── package.json
└── client/          ← SvelteKit (web + mobile)
    └── src/
```

## Conventions de code
- ES Modules (import/export) partout
- Async/await systématiquement, pas de .then()
- Variables d'environnement via process.env, jamais hardcodées
- Réponses API JSON standardisées : { data, error, message }
- Routes RESTful : /api/v1/...

## Déploiement Scalingo
- Procfile dans /server : `web: node src/app.js`
- Variable d'env : MONGO_URL (addon MongoDB Scalingo)
- Variable d'env : PORT (gérée automatiquement par Scalingo)

## Domaine métier
- Utilisateurs : emprunteurs et prêteurs
- Entités principales : User, Loan, LoanRequest, Transaction
- Authentification : JWT