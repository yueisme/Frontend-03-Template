const http = require('http');

let server = http.createServer((request, response) => {
  const {headers, method, url} = request;
  let body                     = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    response.on('error', (err) => {
      console.error(err);
    });

    // Note: the 2 lines above could be replaced with this next one:
    // response.writeHead(200, {'Content-Type': 'application/json'})
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    //response.setHeader('Content-Length', '22');
    //每次write就是一个新的chunk
    response.write(`123456789`);
    response.write(`D`);
    response.write(`à`);
    response.write(`⚠`);
    response.write(`😀`);

    setTimeout(() => {
      response.write(`à😄\nà😄⚠⚠chunk2à😄`);

      response.write(`\nchunk2`);
      response.end();
    }, 100);

  });
}).listen(8080);

process.on('SIGINT', () => {
  console.log('closing server...');
  server.close(function () {
    console.log('server close.');
    process.exit(0);
  });
});
