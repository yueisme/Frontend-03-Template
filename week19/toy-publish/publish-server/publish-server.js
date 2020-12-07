const secret   = process.env['secret'];
const clientId = process.env['clientId'];
// https://docs.github.com/cn/free-pro-team@latest/developers/apps/identifying-and-authorizing-users-for-github-apps

let unzipper = require('unzipper');
let path     = require('path');
let axios    = require('axios');
let fs       = require('fs');
let http     = require('http');
let Koa      = require('koa');

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
router.get('/auth', async (ctx) => {
  if (!ctx.request.query.code) {
    ctx.status = 400;
    ctx.body   = 'require `code` params.';
    return;
  }
  let response     = await axios.request({
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    headers: {
      'User-Agent': 'publish-server',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    params: {},
    data: {
      'client_id': clientId,
      'client_secret': secret,
      'code': ctx.request.query.code,
    },
  });
  let access_token = response.data['access_token'];
  if (access_token) {
    ctx.body = `<a href="http://127.0.0.1:3100/callback?access_token=${access_token}">to publish-tool</a>`;
    return;
  }
  ctx.body = response.data;
});

let LOCK = false;
// http://127.0.0.1:3100/callback?access_token=c8d3fd8580ad68ed982301de9ce320abc59e5bcc
router.post('/publish', async (ctx) => {
  let access_token = ctx.request.query['access_token'];
  if (!access_token) {
    ctx.status = 400;
    ctx.body   = 'require `access_token` params.';
    return;
  }
  let response = await axios.request({
    url: 'https://api.github.com/user',
    method: 'GET',
    headers: {
      'User-Agent': 'publish-server',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `token ${access_token}`,
    },
  });
  let {data}   = response;
  if (data.login !== 'yueisme' || LOCK) {
    ctx.status = 400;
    return;
  }
  //do publish
  ctx.status = 200;
  LOCK       = true;
  console.log('publishing...');
  let unzipStream = unzipper.Extract({path: path.join(__dirname, '../server/public/')});

  await new Promise((resolve, reject) => {
    // `ctx.req`     is Node's request object.
    // `ctx.request` is Koa Request object.
    ctx.req.pipe(unzipStream);
    unzipStream.on('finish', resolve);
    unzipStream.on('error', reject);
  });
  LOCK = false;
  console.log('publish done');
});

app.use(router.routes());

let server = http.createServer(app.callback());

const PORT = 3000;
server.listen(PORT);
console.log(`server running at http://127.0.0.1:${PORT}/`);

process.on('SIGINT', () => { //unsupported windows os
  console.warn('Closing server...');
  server.close(() => {
    console.warn('http closed.');
    process.exit(0);
  });
});
