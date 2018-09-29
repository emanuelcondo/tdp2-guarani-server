const routes = require('../routes/routes');
const Curso = require('../models/curso');
const Carrera = require('../models/carrera');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.loadCourseInfo = () => {
    return (req, res, next) => {
        let course_id = req.params.curso;

        Curso.findOneNoPopulate({ _id: course_id }, (error, result) => {
            if (error) {
                logger.error('[cursos][:curso][carga info] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
            } else if (!result) {
                return routes.doRespond(req, res, HTTP.NOT_FOUND, { mensaje: 'Curso no encontrado.' });
            } else {
                req.context = req.context ? req.context : {};
                req.context.course = result;
                return next();
            }
        });
    }
}

module.exports.belongsToCarrer = () => {
    return (req, res, next) => {
        let course = req.context.course;
        let user = req.context.user;
        let my_carrers = user.carreras.map((carrer) => { return carrer._id; });

        let query = {
            _id: { $in: my_carrers },
            materias: course.materia
        };

        Carrera.findCarrers(query, (error, result) => {
            if (error) {
                logger.error('[inscripciones][cursos][:curso][crear inscripción][check carrera] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
            } else if (result.length == 0) {
                return routes.doRespond(req, res, HTTP.FORBIDDEN, { mensaje: 'Materia no habilitada dentro de la/s carrera/s inscriptas.' });
            } else {
                return next();
            }
        });
    };
};

module.exports.checkCourseAvailability = () => {
    return (req, res, next) => {
        let course = req.context.course;

        if (course.vacantes > 0) {
            return next();
        }

        let query = {
            _id: { $ne: course._id },
            materia: course.materia
        };

        Curso.findNoPopulate(query, (error, result) => {
            if (error) {
                logger.error('[inscripciones][cursos][:curso][crear inscripción][check disponibilidad] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
            } else {
                let availableCourses = result.filter((item) => { return item.vacantes > 0; });
                if (availableCourses.length > 0) {
                    return routes.doRespond(req, res, HTTP.BAD_REQUEST, { mensaje: 'Materia aún cuenta con cursos con vacantes disponibles.' });
                } else {
                    return next();
                }
            }
        });
    }
}

module.exports.retrieveCoursesBySubject = (subject_id, callback) => {
    let query = { materia: ObjectId(subject_id) };

    Curso.findCourses(query, callback);
};

module.exports.decreaseAvailableVacancy = (course_id, callback) => {
    Curso.findOneCourse({ _id : course_id}, (error, course) => {
        if (error) {
            callback(error);
        } else {
            let vacantes = course.vacantes - 1;
            Curso.updateCourse(course_id, { vacantes: vacantes }, callback);
        }
    });
};