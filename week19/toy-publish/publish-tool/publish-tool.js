let archiver = require('archiver');
let path     = require('path');
let axios    = require('axios');
let fs       = require('fs');
let http     = require('http');
let Koa      = require('koa');

let child_process = require('child_process');

let clientId = process.env['clientId'];
let url      = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
let cmd;
switch (process.platform) {
  case 'darwin':
    cmd = 'open';
    break;
  case 'win32':
    cmd = 'start';
    break;
  default:
    cmd = 'xdg-open';
    break;
}
child_process.exec(`${cmd} ${url}`);

let app           = new Koa();
let koaMorgan     = require('../middlewares/morgan');
let koaBodyParser = require('koa-bodyparser');
let KoaRouter     = require('koa-router');
app.use(async function (ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.response.body = err.stack;
  }
});
app.use(koaMorgan);
app.use(koaBodyParser());

let router = new KoaRouter();

router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body   = 'It Works!';
});
router.all('/callback', async (ctx) => {
  let access_token = ctx.request.query['access_token'];
  if (!access_token) {
    ctx.status = 400;
    ctx.body   = 'require `access_token` params.';
    return;
  }
  const archive = archiver('zip', {
    zlib: {level: 9} // Sets the compression level.
  });
  archive.directory(path.join(__dirname, './ready-to-publish/'), false);
  archive.finalize();
  let response = await axios.request({
    url: 'http://127.0.0.1:3000/publish',
    method: 'POST',
    headers: {
      'User-Agent': 'publish-tool',
      'Accept': 'application/json',
      'Content-Type': 'application/octet-stream',
      //'Content-Length':
    },
    params: {
      ...ctx.request.query,
    },
    data: archive,
  });
  ctx.body     = 'ok';
});
app.use(router.routes());

let server = http.createServer(app.callback());

const PORT = 3100;
server.listen(PORT);
console.log(`server running at http://127.0.0.1:${PORT}/`);

process.on('SIGINT', () => {
  console.warn('Closing server...');
  server.close(() => {
    console.warn('http closed.');
    process.exit(0);
  });
});
