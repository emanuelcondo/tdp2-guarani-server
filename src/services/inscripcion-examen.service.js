const routes = require('../routes/routes');
const InscripcionExamen = require('../models/inscripcion-examen');
const ExamenService = require('./examen.service');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const HTTP = require('../utils/constants').HTTP;

module.exports.allowOnlyOneExamInscription = () => {
    return (req, res, next) => {
        let user = req.context.user;
        let exam = req.context.exam;

        let query = {
            alumno: user._id,
            examen: exam
        };

        InscripcionExamen.findOneExamInscription(query, (error, examInscription) => {
            if (error) {
                logger.error('[inscripciones][examenes][:examen][crear inscripcion examen][check] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (examInscription) {
                return routes.doRespond(req, res, HTTP.BAD_REQUEST, { message: 'Inscripción a examen existente.' });
            } else {
                return next();
            }
        });
    };
};

module.exports.retrieveMyExamInscriptions = (user_id, callback) => {
    let query = { alumno: ObjectId(user_id) };

    InscripcionExamen.findExamInscriptions(query, callback);
};

module.exports.deleteExamInscription = (user_id, examInscription_id, callback) => {
    let query = {
        _id: examInscription_id,
        alumno: ObjectId(user_id)
    };

    InscripcionExamen.deleteExamInscription(query, callback);

};

module.exports.retrieveInscriptionToExam = (user_id, examInscription_id, callback) => {
    let query = {
        _id: examInscription_id,
        alumno: ObjectId(user_id)
    };

    InscripcionExamen.findOneInscription(query, callback);
};

module.exports.createExamInscription = (user, examen, callback) => {
    let inscripcion = {
        alumno: user._id,
        examen: examen,
        condicion: 'Regular' /** TODO: pedir el dato */
    };

    InscripcionExamen.createExamInscription(inscripcion, callback);
};

module.exports.retrieveExamInscriptionsWithDetail = (query, callback) => {
    InscripcionExamen.findExamInscriptionsWithUser(query, callback);
};

module.exports.updateExamInscriptions = (query, data, callback) => {
    InscripcionExamen.updateExamInscriptions(query, data, callback);
};

module.exports.retrieveNoPopulate = (query, callback) => {
    InscripcionExamen.findNoPopulate(query, callback);
};