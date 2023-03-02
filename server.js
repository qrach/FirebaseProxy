const http = require('https');

http.createServer((req, res) => {
  const targetUrl = 'https://google.com'; // Replace with the target URL
  const targetReq = http.request(targetUrl, targetRes => {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res);
  });
  req.pipe(targetReq);
}).listen(8080); // Replace with your desired port
