const http = require('http');
const express = require('express');
const app = express();
const router = express.Router();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');

const log4js = require('log4js');
log4js.configure('./src/config/log.conf.json');
const logger = log4js.getLogger('cheese');
if (process.env.NODE_ENV != 'production') {
    logger.level = 'debug';
}

// Log every request to the console
app.use(morgan('dev'));

//the transaction size limit of the server
const limitTransactionsSize = '20mb';
app.use(bodyParser.json({limit: limitTransactionsSize}));
app.use(bodyParser.urlencoded({limit: limitTransactionsSize, extended: true}));

// Simulate DELETE and PUT
app.use(methodOverride());

http.globalAgent.maxSockets = 50;

require('./src/routes/routes.js')(router);

app.use('/api/v1.0', (req, res, next) => {
    process.nextTick(() => {
        router(req, res, next);
    });
});

// catch all exceptions to avoid server crashes
process.on('uncaughtException', function (err) {
    logger.error('*** Caught exception ***' + err);
});

server.listen(port);
logger.info('The magic happens on port ' + port);