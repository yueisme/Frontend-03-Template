const http = require('http');
const fs   = require('fs');

let server = http.createServer((request, response) => {
  const {headers, method, url} = request;

  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    response.on('error', (err) => {
      console.error(err);
    });

    fs.readFile(__dirname + '/default.html',function (err,htmlBuffer) {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Content-Length', htmlBuffer.length);
      response.end(htmlBuffer);
    });


  });
}).listen(8080);

process.on('SIGINT', () => {
  console.log('closing server...');
  server.close(function () {
    console.log('server close.');
    process.exit(0);
  });
});
