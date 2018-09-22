const log4js = require('log4js');

log4js.configure('./src/config/log.conf.json');

const category = (process.env.NODE_ENV != 'production') ? "dev" : "prod";

const logger = log4js.getLogger(category);

module.exports = logger;