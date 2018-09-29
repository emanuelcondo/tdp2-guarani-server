const routes = require('../routes/routes');
const InscripcionCurso = require('../models/inscripcion-curso');
const CursoService = require('./curso.service');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.allowOnlyOneInscription = () => {
    return (req, res, next) => {
        let user = req.context.user;
        let course = req.context.course;

        let query = {
            alumno: user._id,
            materia: course.materia
        };

        InscripcionCurso.findOneInscription(query, (error, inscription) => {
            if (error) {
                logger.error('[inscripciones][cursos][:curso][crear inscripción][check] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
            } else if (inscription) {
                return routes.doRespond(req, res, HTTP.BAD_REQUEST, { mensaje: 'Inscripción a materia existente.' });
            } else {
                return next();
            }
        });
    };
};

module.exports.retrieveMyInscriptions = (user_id, callback) => {
    let query = { alumno: ObjectId(user_id) };

    InscripcionCurso.findInscriptions(query, callback);
};

module.exports.retrieveInscriptionToCourse = (user_id, inscription_id, callback) => {
    let query = {
        _id: inscription_id,
        alumno: ObjectId(user_id)
    };

    InscripcionCurso.findOneInscription(query, callback);
};

module.exports.createInscription = (user, course, callback) => {
    let inscripcion = {
        alumno: user._id,
        curso: null,
        materia: course.materia,
        condicion: ''
    };

    if (course.vacantes > 0) {
        inscripcion.curso = course._id;
        inscripcion.condicion = "Regular";
    } else {
        inscripcion.condicion = "Condicional";
    }

    async.waterfall([
        (wCallback) => {
            if (course.vacantes > 0) {
                CursoService.decreaseAvailableVacancy(course._id, (error, updated) => {
                    wCallback(error);
                });
            } else {
                wCallback();
            }
        },
        (wCallback) => {
            InscripcionCurso.createInscription(inscripcion, wCallback);
        }
    ], callback);
};