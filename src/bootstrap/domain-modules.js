const initModules = appContainer => {

  // clients
  appContainer.factory({
    docuSignClient: require('../clients/docu-sign-client').factory,
    successFactorClient: require('../clients/success-factor-client').factory,
  });


  // managers
  appContainer.factory({
    docuSignManager: require('../managers/docu-sign-manager').factory,
    successFactorManager: require('../managers/success-factor-manager').factory,
  });

  // services
  appContainer.factory({
    docuSignService: require('../services/docu-sign-service').factory,
    successFactorService: require('../services/success-factor-service').factory,
  });


  // routes
  appContainer.factory({
    routes: [
      require('../router/webhook-router').factory,
    ]
  });
};

module.exports = {
  initModules,
};
