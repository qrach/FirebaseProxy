const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  const urienc = req.url.slice(6); // slice '/prox?' from the url
  if (!urienc) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing "urienc" parameter');
    return;
  }
  const uri = Buffer.from(urienc, 'base64').toString();
  proxy.web(req, res, { target: uri }, err => {
    console.log('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
