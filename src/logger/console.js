const log4js = require("log4js");


module.exports = (category) => {
    const logger = log4js.getLogger(category);
    logger.level = process.env.log_level || 'DEBUG';
    return logger;
}

