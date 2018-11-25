const routes = require('../routes/routes');
const Examen = require('../models/examen');
const Curso = require('../models/curso');
const InscripcionExamen = require('../models/inscripcion-examen');
const logger = require('../utils/logger');
const Constants = require('../utils/constants');
const ObjectId = require('mongoose').mongo.ObjectId;
const Acta = require('../models/acta');
const FirebaseData = require('../models/firebase-data').FirebaseData;
const FirebaseService = require('./firebase.service');
const moment = require('moment');
const async = require('async');
const csv = require('fast-csv');
const fs = require('fs');

const EXAM_NOTIFICATION_REMINDER = 'reminder';
const EXAM_NOTIFICATION_UPDATE = 'update';
const EXAM_NOTIFICATION_REMOVE = 'remove';

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
                        aula: null,
                        sede: null
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

    Examen.updateOneExam(query, update,  (error, updated) => {
        if (error) {
            callback(error);
        } else {
            _notifyExamUpdate(updated, EXAM_NOTIFICATION_UPDATE);
            callback(null, updated);
        }
    });
}

module.exports.removeExam = (exam_id, callback) => {
    let query = { _id: exam_id };
    Examen.removeOneExam(query, (error, removed) => {
        if (error) {
            callback(error);
        } else {
            _notifyExamUpdate(removed, EXAM_NOTIFICATION_REMOVE);
            callback(null, removed);
        }
    });
    
}

function _notifyExamUpdate(exam, type) {
    let query = { examen: exam._id };
    let title = '';

    if (type == EXAM_NOTIFICATION_REMINDER) {
        title = 'Recordatorio de Examen';
    } else if (type == EXAM_NOTIFICATION_UPDATE) {
        title = 'Actualización de Examen';
    } else if (type == EXAM_NOTIFICATION_REMOVE) {
        title = 'Examen Cancelado';
    } else {
        return;
    }

    InscripcionExamen.findExamInscriptions(query, (error, inscriptions) => {
        if (error) {
            logger.error('[inscripción-examen]['+type+'][find] '+error);
        } else {
            let user_ids = inscriptions.map((item) => { return item.alumno; });
            let query = { user: { $in: user_ids } };
            FirebaseData.find(query, (error, firebaseData) => {
                if (error) {
                    logger.error('[inscripción-examen]['+type+'][find][firebase-data] '+error);
                } else {
                    let materia = exam.materia;
                    let docente = exam.curso.docenteACargo;
                    let fecha = moment(exam.fecha).locale('es').format('DD-MMM-YYYY hh:mm A');
                    let body = materia.codigo + ' - ' + materia.nombre + '\n';
                    body += 'Fecha: ' + fecha + '\n';
                    body += 'Docente: ' + docente.apellido + ', ' + docente.nombre;
                    for (let item of firebaseData) {
                        let recipient = item.token;
                        FirebaseService.sendToParticular(title, body, recipient);
                    }
                }
            });
        }
    });
}

module.exports.loadExamInfo = () => {
    return (req, res, next) => {

        let exam_id = req.params.examen;

        Examen.findOneNoPopulate({ _id: exam_id }, (error, result) => {
            if (error) {
                logger.error('[examenes][:examen][carga info] '+error);
                return routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (!result) {
                return routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Examen no encontrado.' });
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

module.exports.retrieveInscriptions = (exam_id, toDownload, callback) => {
    let query = { examen: ObjectId(exam_id) };

    InscripcionExamen.findExamInscriptionsWithUser(query, (error, inscriptions) => {
        if (error) {
            callback(error);
        } else {
            let mapped = inscriptions.map((item) => {
                return {
                    _id: item._id,
                    alumno: {
                        legajo: item.alumno.legajo,
                        apellido: item.alumno.apellido,
                        nombre: item.alumno.nombre,
                    },
                    condicion: item.condicion,
                    timestamp: item.timestamp
                };
            });
            mapped.sort((a,b) => {
                let fullname1 = (a.alumno.apellido + ', ' + a.alumno.nombre);
                let fullname2 = (b.alumno.apellido + ', ' + b.alumno.nombre);
                return (fullname1 > fullname2) ? 1 : -1;
            });

            if (toDownload) {
                _generateStudentFile(mapped, callback);
            } else {
                callback(null, { inscripciones: mapped });
            }
        }
    });
}

function _generateStudentFile(inscriptions, callback) {
    let downloadFolder = './downloads';
    if (!fs.existsSync(downloadFolder))
        fs.mkdirSync(downloadFolder);

    let filename = 'examen_'+Date.now().toString()+'.csv';
    let pathToDownload = 'downloads/'+filename;
    var csvStream = csv.createWriteStream({headers: true});
    var writableStream = fs.createWriteStream(pathToDownload);

    writableStream.on('finish', () => {
        callback(null, pathToDownload);
    });

    csvStream.pipe(writableStream);
    
    for (let inscription of inscriptions) {
        let json = {
            'Padrón': inscription.alumno.legajo,
            'Apellidos': inscription.alumno.apellido,
            'Nombres': inscription.alumno.nombre,
            'Condición': inscription.condicion
        }

        csvStream.write(json);
    }

    csvStream.end();
}


module.exports.removeExamAndInscriptions = (exam_id, callback) => {

    
    
    async.waterfall([
        (wCallback) => {
            let query = { _id: exam_id };
            Examen.removeOneExam(query, wCallback);
        },
        (removed, wCallback) => {
            if (removed) {
                _notifyExamUpdate(removed, EXAM_NOTIFICATION_REMOVE);
                let query = { examen: {_id: exam_id }};
                InscripcionExamen.deleteAllExamInscription(query, wCallback);

            } else {
                wCallback(null, null);
            }
        }
    ], callback);
    
}

module.exports.retrieveExamsByProfessor = (user_id, period, callback) => {
    async.waterfall([
        (wCallback) => {
            let query = {
                docenteACargo: user_id,
                cuatrimestre: period.cuatrimestre,
                anio: period.anio
            };
            Curso.findCourses(query, wCallback);
        },
        (courses, wCallback) => {
            let course_ids = courses.map((item) => { return item._id; });
            let query = { curso: { $in: course_ids } };
            Examen.findExams(query, (error, exams) => {
                wCallback(error, courses, exams);
            });
        },
        (courses, exams, wCallback) => {
            async.each(exams, (exam, cb) => {
                let query = { examen: exam._id };
                async.parallel({
                    count: (cb) => {
                        InscripcionExamen.examInscriptionCount(query, cb);
                    },
                    acta: (cb) => {
                        Acta.findOne(query, cb);
                    }
                }, (asyncParallelError, result) => {
                    if (result) {
                        exam.cantidadInscriptos = result.count;
                        exam.acta = result.acta;
                    }
                    cb(asyncParallelError);
                });
            }, (asyncError) => {
                wCallback(asyncError, courses, exams);
            });
        },
        (courses, exams, wCallback) => {
            var materiasMap = {};
            var cursosDeMateriasMap = {};

            for (let course of courses) {
                let materia_id = course.materia._id.toString();
                materiasMap[materia_id] = course.materia;

                cursosDeMateriasMap[materia_id] = cursosDeMateriasMap[materia_id] ? cursosDeMateriasMap[materia_id] : [];
                cursosDeMateriasMap[materia_id].push(course);
            }

            var examenesDeCurso = {};
            for (let exam of exams) {
                let course_id = exam.curso._id.toString();
                examenesDeCurso[course_id] = examenesDeCurso[course_id] ? examenesDeCurso[course_id] : [];
                let json = {
                    _id: exam._id,
                    acta: exam.acta ? exam.acta.codigo : null,
                    aula: exam.aula,
                    sede: exam.sede,
                    fecha: exam.fecha,
                    cantidadInscriptos: exam.cantidadInscriptos
                }
                examenesDeCurso[course_id].push(json);
            }

            var materiasMapValues = Object.values(materiasMap);
            materiasMapValues.sort((a,b) => { return (a.nombre > b.nombre ? 1 : -1); });

            var result = { materias: [] };

            for (let materia of materiasMapValues) {
                let materia_id = materia._id.toString();
                var tmpMateria = {
                    _id: materia_id,
                    codigo: materia.codigo,
                    nombre: materia.nombre,
                    cursos: []
                };
                
                let cursos = cursosDeMateriasMap[materia_id] ? cursosDeMateriasMap[materia_id] : [];
                cursos.sort((a,b) => { return (a.comision > b.comision ? 1 : -1); });

                for (let curso of cursos) {
                    let curso_id = curso._id.toString();
                    var tmpCurso = {
                        _id: curso_id,
                        comision: curso.comision,
                        docenteACargo: curso.docenteACargo,
                        examenes: examenesDeCurso[curso_id] ? examenesDeCurso[curso_id] : []
                    };

                    tmpMateria.cursos.push(tmpCurso);
                }

                result.materias.push(tmpMateria);
            }

            wCallback(null, result);
        }
    ], callback);
}

module.exports.checkAndNotifyActiveExams = (callback) => {
    let tomorrom_from = moment().add(1, 'days').subtract(15, 'minutes');
    let tomorrom_to = moment().add(1, 'days').add(15, 'minutes');

    let query = {
        fecha: {
            $gte: tomorrom_from.toDate(),
            $lte: tomorrom_to.toDate()
        }
    };
    Examen.findExams(query, (error, exams) => {
        if (error) {
            logger.error('[examanes][find][check-and-notify][error] FROM: ' + tomorrom_from.format('DD-MMM-YYYY hh:mm A') + ' TO: ' + tomorrom_to.format('DD-MMM-YYYY hh:mm A') + ' ' + error);
        } else {
            _notifyActiveExams(exams);
        }
    });
}

function _notifyActiveExams(exams) {
    for (let exam of exams) {
        _notifyExamUpdate(exam, EXAM_NOTIFICATION_REMINDER);
    }
}