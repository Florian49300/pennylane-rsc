/**
 * ─────────────────────────────────────────────────────────────
 *  SERVEUR PROXY PENNYLANE — VERSION HÉBERGÉE EN LIGNE
 *  Sert l'application HTML et relaie les appels API vers Pennylane
 *  pour contourner le blocage CORS du navigateur.
 *
 *  Conçu pour être déployé sur Render.com (ou tout hébergeur Node.js).
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// ── URL de base Pennylane selon l'environnement ───────────────
const PENNYLANE_HOSTS = {
  production: 'app.pennylane.com',
  sandbox:    'sandbox.pennylane.com'
};

app.use(express.json({ limit: '5mb' }));

// ── CORS : autorise les appels depuis n'importe quelle origine ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-pennylane-env');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── ROUTE : page d'accueil → sert l'application HTML ──────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_app.html'));
});

// ── ROUTE : vérification de bon fonctionnement (health check) ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pennylane-proxy-rsc' });
});

// ── ROUTE : proxy générique vers l'API Pennylane ───────────────
app.all('/proxy/pennylane/*', (req, res) => {
  const env = req.headers['x-pennylane-env'] || 'production';
  const plHost = PENNYLANE_HOSTS[env] || PENNYLANE_HOSTS.production;

  const apiPath = req.originalUrl.replace('/proxy/pennylane', '');
  const authHeader = req.headers['authorization'] || '';

  console.log(`[PROXY] ${req.method} https://${plHost}${apiPath}`);

  const bodyStr = (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')
    ? JSON.stringify(req.body)
    : null;

  const options = {
    hostname: plHost,
    path: apiPath,
    method: req.method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };
  if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

  const plReq = https.request(options, (plRes) => {
    let data = '';
    plRes.on('data', chunk => { data += chunk; });
    plRes.on('end', () => {
      console.log(`[PROXY] → Réponse ${plRes.statusCode}`);
      res.status(plRes.statusCode);
      res.set('Content-Type', 'application/json');
      res.send(data);
    });
  });

  plReq.on('error', (e) => {
    console.error('[PROXY] Erreur :', e.message);
    res.status(502).json({ error: 'Erreur proxy', detail: e.message });
  });

  if (bodyStr) plReq.write(bodyStr);
  plReq.end();
});

// ── Route inconnue ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Route introuvable');
});

app.listen(PORT, () => {
  console.log(`🟢 Serveur Proxy Pennylane démarré sur le port ${PORT}`);
});
