const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}
const apiRouter = require('./server/routes/api');
const send = require('koa-send');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const auth = require('./server/auth');

const PORT = process.env.PORT || 3000;

// When deployed locally, allow for cross origin requests
if(process.env.NODE_ENV === 'development') {
  app.use(cors());
}

app.use(bodyParser());

passport = auth(app);

app.use(apiRouter(passport).routes());
app.use(serve(__dirname + '/dist'));
app.use(async (ctx, next) => { // Pick up all other routes /form, /facility, etc..
  await send(ctx, 'dist/index.html');
});

app.listen(PORT);

console.log(`Listening on port: ${PORT}`);