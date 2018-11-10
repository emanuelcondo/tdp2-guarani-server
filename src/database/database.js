const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.Promise = global.Promise;

const MONGO_URI = process.env.MONGOLAB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/guarani_prod";

mongoose.connect(MONGO_URI, (error) => {
    if (error) {
        logger.error('Mongoose Connection: Failed ' + error);
    } else {
        logger.info('Mongoose Connection: Successful ');
    }
});