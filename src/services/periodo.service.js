const Periodo = require('../models/periodo').Periodo;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.checkPeriodExists = (update) => {
    return (req, res, next) => {
        let query = {
            cuatrimestre: req.body.cuatrimestre,
            anio: req.body.anio
        }

        Periodo.findOne(query, (error, found) => {
            if (error) {
                logger.error('[periodo][check-period-exists] ' + error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR,  { message: 'Un error inesperado ha ocurrido' });
            } else if (found) {
                if (update && found._id.toString() == req.params.periodo) {
                    return next();
                }
                return routes.doRespond(req, res, HTTP.UNPROCESSABLE_ENTITY, { message: 'El período que se intenta agregar ya existe.' });
            } else {
                return next();
            }
        });
    }
}

module.exports.searchPeriods = (params, callback) => {
    let page = params.page ? parseInt(params.page) : 1;
    let limit = params.limit ? parseInt(params.limit) : 20;

    async.parallel({
        count: (cb) => {
            Periodo.count({}).exec(cb);// .countDocuments({}).exec(cb);
        },
        periodos: (cb) => {
            Periodo.find({})
                    .skip(page - 1)
                    .limit(limit)
                    .sort({ anio: -1, cuatrimestre: -1 })
                    .exec(cb);
        }
    }, (asyncError, result) => {
        let data = null;
        if (result) {
            data = {
                totalcount: result.count,
                totalpages: Math.ceil(result.count / limit),
                page: page,
                periodos: result.periodos
            }
        }
        callback(asyncError, data);
    });
}

module.exports.createPeriod = (body, callback) => {
    Periodo.create(body, callback);
}

module.exports.updatePeriod = (periodo_id, body, callback) => {
    let query = { _id: periodo_id };
    let options = { new: true };
    Periodo.findOneAndUpdate(query, body, options, callback);
}

module.exports.searchCurrentPeriod = (callback) => {
    let VERANO = 0, CUATRI_1 = 1, CUATRI_2 = 2;
    let now = new Date();
    let month = now.getMonth();

    let query = {
        anio: now.getFullYear(),
        cuatrimestre: (month > 7 ? CUATRI_2 : (month > 2 ? CUATRI_1 : VERANO))
    }

    Periodo.findOne(query, callback);
}