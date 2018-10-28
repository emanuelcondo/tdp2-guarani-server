const CronJob = require('cron').CronJob;
const ExamenService = require('../services/examen.service');
const logger = require('../utils/logger');

// At every 30th minute past every hour from 5 through 18
// on every day-of-week from Sunday through Friday.
const cronTime = '* */30 5-18 * * 0-5';
const timeZone = 'America/Argentina/Buenos_Aires';

new CronJob(cronTime, function() {
    execute();
  }, null, true, timeZone);

function execute() {
    logger.debug('[cron][examenes][notificar] Ejecutando...');
    ExamenService.checkAndNotifyActiveExams();
}