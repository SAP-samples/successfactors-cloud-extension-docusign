const logger = require('../../logger/console')("WebHookDocuSignController");

const WebHookDocuSignControllerFactory = (docuSignService) => async (req, res, next) => {
  const body = req.body
  logger.info("Received an request from DocuSign: %s", body)
  try {
    await docuSignService.processEventData(req.body)
    res.status(200).send("");
  } catch (err) {
    res.status(400).send(err.message);
  }
}

module.exports = [{
  method: 'POST',
  path: '/docusign',
  name: 'WebHookDocuSignControllerFactory',
  factory: WebHookDocuSignControllerFactory,
}];
