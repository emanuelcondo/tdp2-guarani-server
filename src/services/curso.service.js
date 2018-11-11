const routes = require('../routes/routes');
const Curso = require('../models/curso');
const Carrera = require('../models/carrera');
const Departamento = require('../models/departamento').Departamento;
const Materia = require('../models/materia');
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
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (!result) {
                return routes.doRespond(req, res, HTTP.NOT_FOUND, { message: 'Curso no encontrado.' });
            } else {
                req.context = req.context ? req.context : {};
                req.context.course = result;
                return next();
            }
        });
    }
}

module.exports.belongsToProfessor = () => {
    return (req, res, next) => {
        let course = req.context.course;
        let user = req.context.user;

        if ((course.docenteACargo && (course.docenteACargo.toString() == user._id.toString())) ||
            (course.jtp && (course.jtp.toString() == user._id.toString())) ||
            (course.ayudantes.indexOf(user._id.toString()) > -1)) {
            return next();
        }

        return routes.doRespond(req, res, HTTP.FORBIDDEN, { message: 'Docente no registrado en este curso.' });
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
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (result.length == 0) {
                return routes.doRespond(req, res, HTTP.FORBIDDEN, { message: 'Materia no habilitada dentro de la/s carrera/s inscriptas.' });
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
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else {
                let availableCourses = result.filter((item) => { return item.vacantes > 0; });
                if (availableCourses.length > 0) {
                    return routes.doRespond(req, res, HTTP.BAD_REQUEST, { message: 'Materia aún cuenta con cursos con vacantes disponibles.' });
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

module.exports.increaseAvailableVacancy = (course_id, callback) => {
    _updateAvailableVacancy(course_id, true, callback);
};

module.exports.decreaseAvailableVacancy = (course_id, callback) => {
    _updateAvailableVacancy(course_id, false, callback);
};

function _updateAvailableVacancy (course_id, increase, callback) {
    Curso.findOneCourse({ _id : course_id}, (error, course) => {
        if (error) {
            callback(error);
        } else {
            let vacantes = course.vacantes + (increase ? 1 : -1);
            Curso.updateCourse(course_id, { vacantes: vacantes }, callback);
        }
    });
};

module.exports.checkCourseExistsBeforeCreating = () => {
    return (req, res, next) => {
        let body = req.body;
        let query = {
            comision: parseInt(body.comision),
            anio: parseInt(body.anio),
            cuatrimestre: parseInt(body.cuatrimestre),
            materia: ObjectId(req.params.materia)
        }

        Curso.findOneNoPopulate(query, (error, found) => {
            if (error) {
                logger.error('[cursos][check-course-exists-after-creating] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (found) {
                let message = 'El curso '+body.comision+' correspondiente al '+(query.cuatrimestre ? (query.cuatrimestre + 'º cuatrimestre') : 'curso de verano') + ' del año ' + body.anio + ' ya existe.';
                return routes.doRespond(req, res, HTTP.UNPROCESSABLE_ENTITY, { message: message });
            } else {
                return next();
            }
        });
    }
}

module.exports.createCourse = (body, callback) => {
    body.comision = parseInt(body.comision);
    body.anio = parseInt(body.anio);
    body.cuatrimestre = parseInt(body.cuatrimestre);
    body.materia = ObjectId(body.materia);
    body.docenteACargo = body.docenteACargo ? ObjectId(body.docenteACargo) : null;
    body.jtp = body.jtp ? ObjectId(body.jtp) : null;
    body.ayudantes = body.ayudantes ? body.ayudantes.map((id) => { return ObjectId(id); }) : [];
    body.cupos = parseInt(body.cupos);
    body.vacantes = body.cupos;
    body.cursada = body.cursada ? body.cursada : [];

    Curso.createCourse(body, (error, created) => {
        if (error) {
            callback(error);
        } else {
            Curso.findOneCourse({ _id: created._id }, callback);
        }
    });
}

module.exports.updateCourse = (course_id, body, callback) => {
    let update = {
        $set: {
            cupos: parseInt(body.cupos),
            docenteACargo: body.docenteACargo ? ObjectId(body.docenteACargo) : null,
            jtp: body.jtp ? ObjectId(body.jtp) : null,
            ayudantes: body.ayudantes ? body.ayudantes.map((id) => { return ObjectId(id); }) : [],
            cursada: body.cursada ? body.cursada : []
        }
    }

    Curso.updateCourse(course_id, update, (error, updated) => {
        if (error) {
            callback(error);
        } else if (!updated) {
            callback(null, null);
        } else {
            Curso.findOneCourse({ _id: updated._id }, callback);
        }
    });
}

module.exports.belongsToAsignature = () => {
    return (req, res, next) => {
        let query = {
            _id: ObjectId(req.params.curso),
            materia: ObjectId(req.params.materia)
        }
        Curso.findOneNoPopulate(query, (error, found) => {
            if (error) {
                logger.error('[cursos][pertenece-a-materia] '+error);
                return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (!found) {
                let message = 'El curso con id '+req.params.curso+' con materia '+req.params.materia+' no existe.';
                return routes.doRespond(req, res, HTTP.UNPROCESSABLE_ENTITY, { message: message });
            } else {
                return next();
            }
        });
    }
}

module.exports.removeCourse = (course_id, callback) => {
    Curso.removeCourse(course_id, callback);
}

module.exports.searchCoursesByDepartament = (departament_id, params, callback) => {
    let page = params.page ? parseInt(params.page) : 1;
    let limit = params.limit ? parseInt(params.limit) : 20;

    async.waterfall([
        (wCallback) => {
            let query = { departamento: ObjectId(departament_id) };
            if (params.materia) query['_id'] = ObjectId(params.materia);
            Materia.findNoPopulate(query, wCallback);
        },
        (asignatures, wCallback) => {
            let asignature_ids = asignatures.map((item) => { return item._id; });
            let query = {
                materia: { $in: asignature_ids }
            };

            if (params.docenteACargo) query['docenteACargo'] = ObjectId(params.docenteACargo);
            if (params.jtp) query['jtp'] = ObjectId(params.jtp);
            if (params.anio) query['anio'] = parseInt(params.anio);
            if (params.cuatrimestre) query['cuatrimestre'] = parseInt(params.cuatrimestre);

            async.parallel({
                count: (cb) => {
                    Curso.countCourses(query, cb);
                },
                cursos: (cb) => {
                    Curso.findWithPagination(query, { page: page, limit: limit }, cb);
                }
            }, (asyncError, result) => {
                let data = null;
                if (result) {
                    data = {
                        totalcount: result.count,
                        totalpages: Math.ceil(result.count / limit),
                        page: page,
                        cursos: result.cursos
                    }
                }
                wCallback(asyncError, data);
            });
        }
    ], callback);
}

