const logger = require('../logger/console')("Boostrap");
const appContainer = require('./application-container')();
const initialize = require('./initialize');

const { initModules } = require('./domain-modules');
const { setupExpressServer } = require('./server');
const { postStart } = require('./post-start-server');

const bootstrapApplication = () =>
    initialize(appContainer)
    .then(() => initModules(appContainer))
    .then(() => setupExpressServer(appContainer))
    .then((server) => {
      postStart(appContainer).catch((err) => logger.error(err.message))
      return server
    });

module.exports = {
  bootstrapApplication,
};
