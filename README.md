# Pennylane Proxy — RSC

Application de retraitement des écritures de caisse + connecteur API Pennylane.

## Contenu

- `server.js` — serveur (Express) qui sert l'application et relaie les appels vers Pennylane
- `public_app.html` — l'application web (interface utilisateur)
- `package.json` — dépendances Node.js

## Déploiement sur Render.com (gratuit)

1. Créez un compte sur https://render.com (connexion possible avec GitHub)
2. Cliquez sur **"New +" → "Web Service"**
3. Connectez ce dépôt GitHub
4. Render détecte automatiquement Node.js. Vérifiez :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Cliquez sur **"Create Web Service"**
6. Au bout de 2-3 minutes, votre application est en ligne à une adresse du type :
   `https://pennylane-proxy-rsc.onrender.com`

## Test en local (avant déploiement)

```bash
npm install
npm start
```

Puis ouvrez http://localhost:3000

## Notes

- Le tier gratuit de Render met le service en veille après 15 min d'inactivité.
  La première requête après une période d'inactivité peut prendre 30-60 secondes (réveil du service).
- Aucune donnée n'est stockée sur le serveur : il ne fait que relayer les appels API vers Pennylane.
