const fnArgs = require('parse-fn-args');
const logger = require('../logger/console')("Application Container");

module.exports = () => {
  const dependencies = {};
  const factories = {};

  const appContainer = {
    factory: facts => {
      Object.keys(facts).forEach(factory => {
        factories[factory] = facts[factory];
        logger.info(`Factory '${factory}' injected.`);
      });
    },
    register: deps => {
      Object.keys(deps).forEach(dep => {
        dependencies[dep] = deps[dep];
        logger.info(`Dependency '${dep}' injected.`);
      });
    },
    get: name => {
      if (!dependencies[name]) {
        const factory = factories[name];
        const factoryLambda = (f) => f && appContainer.inject(f)
        if (factory instanceof Array) {
          dependencies[name] = factory.map(factoryLambda)
        } else {
          dependencies[name] = factoryLambda(factory);
        }
        if (!dependencies[name]) {
          throw new Error(`Cannot find module: ${name}`);
        }
      }
      return dependencies[name];
    },
    inject: factory => {
      const argsLambda = (f) => fnArgs(f).map(dep => appContainer.get(dep));
      if (factory instanceof Array) {
        return factory.flatMap(appContainer.inject)
      } else {
        return factory(...argsLambda(factory));
      }
    },
    dependencies: () => dependencies,
  };

  // Inject the appContainer into it so others can require it as a dependency
  appContainer.register({ applicationContainer: appContainer });
  appContainer.register({ appContainer: appContainer });
  appContainer.register({ container: appContainer });

  return appContainer;
};
