const logger = require('../../logger/console')("WebHookSuccessFactorController");

const WebHookSuccessFactorControllerFactory = (successFactorService) => async (req, res, next) => {
  const body = req.body
  logger.info("Received an request from SF: %s", body)
  try {
    const respData = await successFactorService.processEventData(body)
    res.header('Content-Type', 'application/soap+xml')
    res.status(200).send(respData);
    logger.info("SF Event processed with success: %s", respData)
  } catch (err) {
    logger.info("Failed to process the SF event; %s", err)
    res.status(400).send(err.message);
  }

}

module.exports = [{
  method: 'POST',
  path: '/success-factors',
  name: 'WebHookSuccessFactorControllerFactory',
  factory: WebHookSuccessFactorControllerFactory,
}];
