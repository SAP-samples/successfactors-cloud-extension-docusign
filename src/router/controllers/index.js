module.exports = {
    webHookControllers: [
        ...require('./success-factor-webhook-controller'),
        ...require('./docusign-webhook-controller'),
    ],
};
