const http = require('http');
const https = require('https');
const url = require('url');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROXY_PORT = 8080;
const PROXY_DIR = 'prox';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const urienc = parsedUrl.query.urienc;

  if (urienc) {
    const uri = Buffer.from(urienc, 'base64').toString();
    const protocol = uri.startsWith('https') ? https : http;

    protocol.get(uri, (response) => {
      res.writeHead(response.statusCode, response.headers);

      response.on('data', (chunk) => {
        const filteredChunk = chunk.toString().replace(/(http[s]?:\/\/)?((?!(localhost|\.)[\w\d\.-]+)[\w\d\.-]+)(:\d+)?/gi, `http://localhost:${PROXY_PORT}/${PROXY_DIR}/$2$4`);
        res.write(filteredChunk);
      });

      response.on('end', () => {
        res.end();
      });
    }).on('error', (error) => {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error');
    });
  } else if (parsedUrl.pathname === `/${PROXY_DIR}`) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = fs.readFileSync(path.join(__dirname, 'index.html'));
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const urienc = data.urienc;
    const uri = Buffer.from(urienc, 'base64').toString();
    const protocol = uri.startsWith('https') ? https : http;

    const hashedUri = crypto.createHash('md5').update(uri).digest('hex');

    protocol.get(uri, (response) => {
      ws.send(JSON.stringify({
        event: 'response',
        uri: urienc,
        hash: hashedUri,
        status: response.statusCode,
        headers: response.headers,
      }));

      response.on('data', (chunk) => {
        const filteredChunk = chunk.toString().replace(/(http[s]?:\/\/)?((?!(localhost|\.)[\w\d\.-]+)[\w\d\.-]+)(:\d+)?/gi, `http://localhost:${PROXY_PORT}/${PROXY_DIR}/$2$4`);
        ws.send(JSON.stringify({
          event: 'data',
          uri: urienc,
          hash: hashedUri,
          data: filteredChunk,
        }));
      });

      response.on('end', () => {
        ws.send(JSON.stringify({
          event: 'end',
          uri: urienc,
          hash: hashedUri,
        }));
      });
    }).on('error', (error) => {
      console.error(error);
      ws.send(JSON.stringify({
        event: 'error',
        uri: urienc,
        hash: hashedUri,
      }));
    });
  });
});

server.listen(PROXY_PORT, () => {
  console.log(`Proxy server listening on port ${PROXY_PORT}`);
});
