# Business de Sidi

Application de gestion agricole pour suivre le stock, les revenus, les bénéfices, les achats, les ventes et les alertes.

## GitHub

- Ce projet est conçu pour être utilisé comme dépôt GitHub.
- Clone le dépôt :

```bash
git clone <url-du-repo>
cd agriculture
```

- Crée une branche pour chaque modification :

```bash
git checkout -b feature/ma-modification
```

- Enregistre et pousse les changements :

```bash
git add .
git commit -m "Ajout de la fonctionnalité"
git push origin feature/ma-modification
```

## Installation locale

1. Ouvre un terminal dans le dossier du projet
1. Installe les dépendances :

```bash
npm install
```

1. Crée un fichier `.env` avec les variables suivantes :

```env
PORT=3102
DATA_DIR=./data
JWT_SECRET=remplace-par-une-cle-aleatoire-d-au-moins-32-caracteres
ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=choisis-un-mot-de-passe-unique-de-12-caracteres-minimum
VAPID_EMAIL=mailto:your-email@example.com
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

- Ne publie jamais le vrai fichier `.env`. Les clés VAPID sont facultatives ; laisse-les vides si tu n'utilises pas les notifications push.
- `DATA_DIR` désigne le dossier où l'application enregistre le fichier JSON et les sauvegardes.

1. Double-clique sur `demarrer.bat` pour lancer le projet.

Cela démarre le serveur sur le port 3102, attend qu’il soit prêt, puis ouvre automatiquement la page d’authentification `http://localhost:3102/auth.html`.

1. Connecte-toi ou crée un compte pour accéder ensuite à l’application sur `http://localhost:3102`.

## Fonctionnalités

- Authentification utilisateur
- Gestion des achats, ventes, stocks et pertes
- Historique avec filtres et statistiques
- Graphiques de performance
- Export Excel / CSV
- Alertes de stock

## Structure

- `server.js` : serveur Express principal
- `middleware/auth.js` : middleware JWT
- `public/` : interface web HTML/CSS/JS
- `public/auth.html` : page de connexion/inscription
- `public/auth.js` : logique d'authentification frontend

## Déploiement public Railway

Le dépôt inclut `railway.json` pour lancer l'application et vérifier son endpoint `/health`.
Railway attribue un domaine public au service après sa création : aucun domaine personnel n'est nécessaire.

1. Pousse le projet sur un dépôt GitHub (privé recommandé pour limiter l'exposition du code), puis connecte ce dépôt à Railway.
2. Dans le service Railway, ajoute un **Volume** monté sur `/data`, puis règle `DATA_DIR=/data`.
3. Ajoute les variables `NODE_ENV=production`, `JWT_SECRET`, `ADMIN_EMAIL` et `INITIAL_ADMIN_PASSWORD` dans les variables Railway. Utilise des valeurs uniques et secrètes ; le mot de passe initial doit faire au moins 12 caractères.
4. Garde une seule instance du service : le stockage JSON sur volume est conçu pour un seul processus applicatif.
5. Déploie, utilise l'action **Generate Domain** dans les réglages réseau Railway, puis ouvre l'URL HTTPS attribuée. Le QR mobile détecte automatiquement le domaine transmis par le proxy.

En production, l'application refuse un secret JWT d'exemple, crée l'administrateur initial depuis les variables configurées et hache les mots de passe. Si tu migres des données locales, sauvegarde d'abord `data/storage.json` et ne commite pas ce fichier : il contient des données privées.
