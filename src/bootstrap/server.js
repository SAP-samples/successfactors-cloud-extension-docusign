const app = require('express')();
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OK } = require('http-status-codes');

const setupExpressServer = applicationContainer => {
  // app.use(compression());

  //
  // app.use(
  //   cors({
  //     origin: '*',
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     preflightContinue: false,
  //     optionsSuccessStatus: OK,
  //   }),
  // );
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: false }));



  app.use((req, res, next) => {
    let data = "";

    req.setEncoding("utf8");
    req.on("data", function (chunk) {
      data += chunk;
    });

    req.on("end", function () {
      req.body = data;
      next();
    });
  });

  app.get('/livez', (req, res) => {
    res.sendStatus(200);
  });
  app.get('/readyz', (req, res) => {
    res.sendStatus(200);
  });
  app.get('/healthz', (req, res) => {
    res.sendStatus(200);
  });

  const routes = applicationContainer.get('routes')
  if (routes instanceof Array) {
    routes.forEach((r) => app.use(r))
  }


  return app;
};

module.exports = {
  setupExpressServer,
};
