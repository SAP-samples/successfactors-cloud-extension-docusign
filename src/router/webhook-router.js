const express = require('express');
const { webHookControllers } = require('./controllers');
const { server: { baseUrl } } = require('../constants/constants');
const registerRoutes = require('./router-handler');

module.exports = {
    factory: appContainer => {
        let url = baseUrl
        if (url.endsWith("/")) {
            url = url.substring(0, url.length - 1)
        }
        return registerRoutes(appContainer, `${url}/webhook`, express.Router(), webHookControllers);
    }
};
