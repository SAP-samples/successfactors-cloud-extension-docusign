
module.exports = (container, basePath, router, handlers) => {
  if (basePath.endsWith("/")) {
    basePath = basePath.substring(0, basePath.length - 1)
  }
  handlers.forEach(handler => {
    if (handler.path.startsWith("/")) {
      handler.path = handler.path.substring(1)
    }
    router[handler.method.toLowerCase()](`${basePath}/${handler.path}`, container.inject(handler.factory));
  });
  return router;
};
