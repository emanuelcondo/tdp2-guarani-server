const routes = require('../routes/routes');
const InscripcionCurso = require('../models/inscripcion-curso');
const Alumno = require('../models/alumno').Alumno;
const CursoService = require('./curso.service');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');
const moment = require('moment');

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
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (inscription) {
                return routes.doRespond(req, res, HTTP.BAD_REQUEST, { message: 'Inscripción a materia existente.' });
            } else {
                return next();
            }
        });
    };
};

module.exports.checkConditionalStudents = () => {
    return (req, res, next) => {
        let course = req.context.course;
        let ids = req.body.alumnos;
        ids = ids.filter((id, index) => { return ids.indexOf(id) == index; }); // remove duplicates
        let students = null;
        
        try {
            students = ids.map((id) => { return ObjectId(id); });
        } catch (e) {
            return routes.doRespond(req, res, HTTP.UNPROCESSABLE_ENTITY, { message: 'Verifiqué que los datos ingresados correspondientes a alumnos sean válidos.' });
        }

        let query = {
            curso: null,
            materia: course.materia,
            alumno: { $in: students }
        };

        InscripcionCurso.findNoPopulate(query, (error, inscriptions) => {
            if (error) {
                logger.error('[inscripciones][docente][aceptar condicionales][check] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else {
                let foundStudents = inscriptions.map((item) => { return item.alumno.toString(); });
                for (let id of ids) {
                    if (foundStudents.indexOf(id) == -1) {
                        return routes.doRespond(req, res, HTTP.UNPROCESSABLE_ENTITY, { message: 'Alumno con id \''+id+'\' no encontrado dentro de los condicionales a tal materia.' });
                    }
                }
                return next();
            }
        });
    }
};

module.exports.retrieveMyInscriptions = (user_id, period, callback) => {
    let query = { alumno: ObjectId(user_id) };

    InscripcionCurso.findInscriptions(query, (error, inscriptions) => {
        let result = null;
        if (inscriptions) {
            result = inscriptions.filter((item) => {
                return item.condicion == "Condicional" || (item.curso.cuatrimestre == period.cuatrimestre && item.curso.anio == period.anio);
            });
        }
        callback(error, result);
    });
};

module.exports.checkPriorityForStudent = () => {
    return (req, res, next) => {
        let priority = req.context.user.prioridad;
        let period = req.context.period;

        return next();
    }
}

module.exports.deleteInscription = (user_id, inscription_id, callback) => {
    let query = {
        _id: inscription_id,
        alumno: ObjectId(user_id)
    };

    async.waterfall([
        (wCallback) => {
            InscripcionCurso.deleteInscription(query, wCallback);
        },
        (inscription, wCallback) => {
            if (inscription) {
                if (inscription.condicion == "Regular" && inscription.curso) {
                    let course_id = inscription.curso;
                    CursoService.increaseAvailableVacancy(course_id, (error, updatedCourse) => {
                        if (error) {
                            wCallback(error);
                        } else {
                            wCallback(null, inscription);
                        }
                    });
                } else {
                    wCallback(null, inscription);
                }
            } else {
                wCallback(null, null);
            }
        }
    ], callback);
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
        condicion: '',
        notaCursada: null
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

module.exports.retrieveInscriptionsWithDetail = (query, callback) => {
    InscripcionCurso.findInscriptionsWithUser(query, callback);
};

module.exports.updateInscriptions = (query, data, callback) => {
    InscripcionCurso.updateInscriptions(query, data, callback);
};

module.exports.retrieveNoPopulate = (query, callback) => {
    InscripcionCurso.findNoPopulate(query, callback);
};

module.exports.updateCourseQualification = (course_id, students, callback) => {
    let qualificationMap = {};
    for (let student of students) {
        let legajo = parseInt(student.padron);
        let nota = parseInt(student.nota);
        qualificationMap[legajo] = nota;
    }

    async.waterfall([
        (wCallback) => {
            let query = { legajo: { $in: Object.keys(qualificationMap) } };
            Alumno.find(query, { legajo: 1 }, wCallback);
        },
        (records, wCallback) => {
            async.each(records, (record, cb) => {
                let query = { curso: ObjectId(course_id), alumno: record._id };
                let update = { $set: { notaCursada: qualificationMap[record.legajo] } };
                InscripcionCurso.updateInscriptions(query, update, cb);
            }, wCallback);
        },
    ], (asyncError, result) => {
        callback(asyncError);
    });
}