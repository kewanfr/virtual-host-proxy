const http = require('http');
const https = require('https');
const fs = require('fs');
const httpProxy = require('http-proxy');
const express = require('express');

// Chemins vers vos certificats SSL
const sslOptions = {
  key: fs.readFileSync('/path/to/your/ssl.key'), // Remplacez par le chemin réel de votre clé SSL
  cert: fs.readFileSync('/path/to/your/ssl.crt') // Remplacez par le chemin réel de votre certificat SSL
};

// Créer une instance de proxy
const proxy = httpProxy.createProxyServer({});

// Application Express pour votre API
const apiApp = express();

// Exemple d'endpoint API
apiApp.get('/api', (req, res) => {
  res.json({ message: 'Hello from your API!' });
});

// Créer les serveurs HTTP et HTTPS
const httpServer = http.createServer((req, res) => {
  if (req.headers.host === 'kewan.freeboxos.fr') {
    res.writeHead(301, { "Location": "https://kewan.freeboxos.fr" });
    res.end();
  } else if (req.headers.host === 'node.kewan.fr') {
    apiApp(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const httpsServer = https.createServer(sslOptions, (req, res) => {
  if (req.headers.host === 'kewan.freeboxos.fr') {
    proxy.web(req, res, { target: 'https://192.168.0.254', secure: false });
  } else if (req.headers.host === 'node.kewan.fr') {
    apiApp(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Écouter sur les ports 80 (HTTP) et 443 (HTTPS)
httpServer.listen(80, () => {
  console.log('HTTP server listening on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS server listening on port 443');
});
