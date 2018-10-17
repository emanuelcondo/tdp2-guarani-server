const routes = require('../routes/routes');
const Examen = require('../models/examen');
const Curso = require('../models/curso');
const logger = require('../utils/logger');
const Constants = require('../utils/constants');

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