let http              = require('http');
const {name: appName} = require('../package.json');

let path          = require('path');
let koaStatic     = require('koa-static');
let koaMount      = require('koa-mount');
let koaBodyParser = require('koa-bodyparser');
let koaMorgan     = require('../middlewares/morgan');
let Koa           = require('koa');

let app = new Koa();
//app.proxy = config.env!=='dev';

app.on('error', function (err, ctx) {
  console.error('koa server error: %s', err);
});

app.use(async function (ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.response.body = err.stack;
  }
});

app.use(koaMorgan);

app.keys = [appName];

let staticMiddleware = koaStatic('./public/', {
  maxage: 0,
  defer: false, //true会先放行到后面的中间件再发送文件
  gzip: false
});
app.use(koaMount('/', staticMiddleware));
app.use(koaBodyParser({}));

let server = http.createServer(app.callback());

const PORT = 3200;
server.listen(PORT);
console.log(`server running at http://127.0.0.1:${PORT}/`);

process.on('SIGINT', () => { //unsupported windows os
  console.warn('Closing server...');
  server.close(() => {
    console.warn('http closed.');
    process.exit(0);
  });
});
