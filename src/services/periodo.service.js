const Periodo = require('../models/periodo').Periodo;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

const PERIODO_INSCRIPCION_CURSO = 1;
const PERIODO_DESINSCRIPCION_CURSO = 2;
const PERIODO_INSCRIPCION_EXAMEN = 3;
const PERIODO_CONSULTAR_PRIORIDAD = 4;
const PERIODO_CURSADA = 5;

module.exports.PERIODO_INSCRIPCION_CURSO = PERIODO_INSCRIPCION_CURSO;
module.exports.PERIODO_DESINSCRIPCION_CURSO = PERIODO_DESINSCRIPCION_CURSO;
module.exports.PERIODO_INSCRIPCION_EXAMEN = PERIODO_INSCRIPCION_EXAMEN;
module.exports.PERIODO_CONSULTAR_PRIORIDAD = PERIODO_CONSULTAR_PRIORIDAD;
module.exports.PERIODO_CURSADA = PERIODO_CURSADA;

module.exports.loadCurrentPeriod = () => {
    return (req, res, next) => {
        module.exports.searchCurrentPeriod((error, result) => {
            if (error) {
                logger.error('[periodo][cargar-periodo-actual] ' + error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR,  { message: 'Un error inesperado ha ocurrido' });
            } else if (!result) {
                return routes.doRespond(req, res, HTTP.NOT_FOUND, { message: 'No se ha encontrado información sobre el período actual.' });
            } else {
                req.context = req.context ? req.context : {};
                req.context.period = result;
                return next();
            }
        });
    }
}

module.exports.checkPeriod = (type) => {
    return (req, res, next) => {
        let period = req.context.period;
        let periodData = null;

        switch (type) {
            case PERIODO_INSCRIPCION_CURSO:
                periodData = period.inscripcionCurso;
                break;
            case PERIODO_DESINSCRIPCION_CURSO:
                periodData = period.desinscripcionCurso;
                break;
            case PERIODO_INSCRIPCION_EXAMEN:
                periodData = period.inscripcionExamen;
                break;
            case PERIODO_CURSADA:
                periodData = period.cursada;
                break;
            case PERIODO_CONSULTAR_PRIORIDAD:
                periodData = period.consultaPrioridad;
                break;
            default:
                break;
        }

        if (periodData) {
            let now = (new Date()).getTime();
            let start = periodData.inicio.getTime();
            let end = periodData.fin.getTime();
            if (now >= start && end >= now) {
                return next();
            } else {
                return routes.doRespond(req, res, HTTP.BAD_REQUEST, { message: 'La tarea que desea realizar no está en vigencia.' });
            }
        } else {
            logger.debug('[periodo][check-periodo] Período con id ' + type + ' no encontrado.');
            return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
        }
    }
}

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