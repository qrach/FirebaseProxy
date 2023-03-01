const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const apiProxy = httpProxy.createProxyServer();

// Proxy middleware
app.use('/', (req, res) => {
  const urienc = req.query.urienc;
  if (!urienc) {
    res.status(400).send('Missing "urienc" parameter');
    return;
  }
  const uri = Buffer.from(urienc, 'base64').toString();
  apiProxy.web(req, res, { target: uri });
});

// Error handling
apiProxy.on('error', (err, req, res) => {
  console.log('Proxy error:', err);
  res.status(500).send('Proxy error');
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
