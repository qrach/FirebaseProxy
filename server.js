const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');

const PORT = 8080; // port to listen on

const server = https.createServer(options, (req, res) => {
    const { pathname, query } = url.parse(req.url);
    const { urienc } = querystring.parse(query);
    
    // check if the URL matches the required format
    if (pathname === '/prox' && urienc) {
        // decode the base64-encoded URL
        const uri = Buffer.from(urienc, 'base64').toString('utf-8');
        const parsedUri = url.parse(uri);
        
        // create options for the proxy request
        const proxyOptions = {
            hostname: parsedUri.hostname,
            port: parsedUri.port || 80,
            path: parsedUri.path,
            method: req.method,
            headers: req.headers
        };
        
        // send the proxy request
        const proxyReq = https.request(proxyOptions, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        req.pipe(proxyReq);
    } else {
        res.statusCode = 404;
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
