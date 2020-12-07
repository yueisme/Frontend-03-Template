// https://github.com/expressjs/morgan

const morgan  = require('morgan');
const Promise = require('bluebird');
const moment  = require('moment');

function koaMorgan(format, options) {
  const fn = morgan(format, options);
  return (ctx, next) => {
    // morgan default use 'req.ip' and 'req.connection.remoteAddress' for express.js
    //ctx.req._ip = ctx.request.ip;
    return new Promise((resolve, reject) => {
      fn(ctx.req, ctx.res, (err) => {
        err ? reject(err) : resolve(ctx);
      });
    }).then(next);
  };
}

koaMorgan.compile = morgan.compile;
koaMorgan.format  = morgan.format;
koaMorgan.token   = morgan.token;

//koaMorgan.token('ip', (req, res) => req._ip);

module.exports = koaMorgan(':remote-addr "HTTP/:http-version :method :url" :status response length::res[content-length]', {
  stream: {
    write: function (message, encoding) {
      let time = moment().format('YYYY-MM-DD HH:mm:ss Z');
      console.log(`[${time}] ${message}`);
    },
  },
});

