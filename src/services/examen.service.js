const routes = require('../routes/routes');
const Examen = require('../models/examen');
const Curso = require('../models/curso');
const InscripcionExamen = require('../models/inscripcion-examen');
const logger = require('../utils/logger');
const Constants = require('../utils/constants');
const ObjectId = require('mongoose').mongo.ObjectId;
const HTTP = require('../utils/constants').HTTP;
const async = require('async');
//const util = require('util')

const MAX_EXAMS_PER_PERIOD = 5;

module.exports.checkExamCountForCourse = () => {
    return (req, res, next) => {
        let course = req.context.course;

        let query = { curso: course._id };

        Examen.countExams(query, (error, count) => {
            if (error) {
                logger.error('[docentes][mis-cursos][curso][crear-examen][check-count] '+error);
                return routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else {
                if (count < MAX_EXAMS_PER_PERIOD) {
                    return next();
                } else {
                    return routes.doRespond(req, res, Constants.HTTP.BAD_REQUEST, { message: 'La cantidad de examenes por período completo. Cantidad máxima por período: '+MAX_EXAMS_PER_PERIOD+'.' });
                }
            }
        });
    }
}

module.exports.belongsToCourse = () => {
    return (req, res, next) => {
        let course_id = req.params.curso;
        let query = { _id: req.params.examen };

        Examen.findOneNoPopulate(query, (error, found) => {
            if (error) {
                logger.error('[docentes][mis-cursos][curso][examenes][check-pertenencia-curso] '+error);
                return routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (found) {
                if (found.curso.toString() == course_id) {
                    return next();
                } else {
                    return routes.doRespond(req, res, Constants.HTTP.UNAUTHORIZED, { message: 'Acceso denegado. Examen con id \''+req.params.examen+'\' no pertenece al curso con id \''+req.params.curso+'\'.' });
                }
            } else {
                return routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Examen con id \''+req.params.examen+'\' no encontrado.' });
            }
        });
    }
}

module.exports.createExam = (course_id, body, callback) => {
    let query = { _id: course_id };
    Curso.findOneCourse(query, (error, foundCourse) => {
        if (error) {
            callback(error);
        } else if (foundCourse) {
            let exam = {
                curso: foundCourse._id,
                materia: foundCourse.materia._id,
                fecha: body.fecha
            }

            Examen.createExam(exam, (error, created) => {
                let result = null;
                if (created) {
                    result = {
                        curso: {
                            _id: foundCourse._id,
                            comision: foundCourse.comision,
                            docenteACargo: foundCourse.docenteACargo
                        },
                        materia: foundCourse.materia,
                        fecha: created.fecha,
                        aula: null
                    }
                }
                callback(error, result);
            });
        } else {
            callback(null, null);
        }
    });
}

module.exports.retrieveExamsBySubject = (subject_id, callback) => {
    let query = { materia: ObjectId(subject_id) };
    Examen.findExams(query, callback);
}

module.exports.retrieveExamsByCourse = (course_id, callback) => {
    let query = { curso: ObjectId(course_id) };
    Examen.findExams(query, callback);
}

module.exports.updateExam = (exam_id, body, callback) => {
    let query = { _id: exam_id };
    let update = { fecha: body.fecha };

    Examen.updateOneExam(query, update, callback);
}

module.exports.removeExam = (exam_id, callback) => {
    let query = { _id: exam_id };
    Examen.removeOneExam(query, callback);
}

module.exports.loadExamInfo = () => {
    return (req, res, next) => {
        //console.log(util.inspect(req.parsams, false, null, true /* enable colors */));

        let exam_id = req.params.examen;

        Examen.findOneNoPopulate({ _id: exam_id }, (error, result) => {
            if (error) {
                logger.error('[examenes][:examen][carga info] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (!result) {
                return routes.doRespond(req, res, HTTP.NOT_FOUND, { message: 'Examen no encontrado.' });
            } else {
                req.context = req.context ? req.context : {};
                req.context.exam = result;
                return next();
            }
        });
    }
}

module.exports.retrieveExamsBySubjectExceptUserPicked = (user, subject_id, callback) => {

    async.waterfall([
        (wCallback) => {
            let query = { alumno: ObjectId(user._id) };
            InscripcionExamen.findExamInscriptions(query, wCallback);
        },
        (examInscriptions, wCallback) => {
            if (examInscriptions) {
                let inscriptions_ids = examInscriptions.map((item) => { return item.examen._id; });
                let query = { _id: { $nin: inscriptions_ids }, materia: subject_id }

                Examen.findExams(query, wCallback);
            } else {
                wCallback(null, null);
            }
        }
    ], callback);
};