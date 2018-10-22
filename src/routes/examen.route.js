const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const DocenteService = require('../services/docente.service');
const CursoService = require('../services/curso.service');
const ExamenService = require('../services/examen.service');
const logger = require('../utils/logger');
const fs = require('fs');

const BASE_STUDENT_URL = '/materias/:materia/examenes';
const BASE_PROFESSOR_URL = '/docentes/mis-cursos/:curso/examenes';

var ExamenRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/:materia/examenes Lista de examenes - Alumnos
     * @apiDescription Retorna los examenes asociadas a una materia (Excepto los que el alumno ya esté inscripto)
     * @apiName retrieve
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "examenes": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "curso": {
     *                      "_id": "b2bc2187abc8fe8a8dcb7432",
     *                      "comision": 1,
     *                      "docenteACargo": {
     *                          "_id": "5ba715541dabf8854f11e0c0",
     *                          "nombre": "Moises Carlos",
     *                          "apellido": "Fontela"
     *                      }
     *                  },
     *                  "materia": {
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": {
     *                      "_id": "ddbc2187abc8fe8a8dcb7144",
     *                      "sede": "PC",
     *                      "aula": "203"
     *                  },
     *                  "fecha": "2018-12-04T19:00:00.000Z"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7122",
     *                  "curso": {
     *                      "_id": "b2bc2187abc8fe8a8dcb7432",
     *                      "comision": 1,
     *                      "docenteACargo": {
     *                          "_id": "5ba715541dabf8854f11e0c0",
     *                          "nombre": "Moises Carlos",
     *                          "apellido": "Fontela"
     *                      }
     *                  },
     *                  "materia": {
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": null,
     *                  "fecha": "2018-12-11T19:00:00.000Z"
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_STUDENT_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            let user = req.context.user;

            ExamenService.retrieveExamsBySubjectExceptUserPicked(user, req.params.materia, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][examenes][alumno] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { examenes: result });
                }
            });
        });

    /**
     * @api {get} /api/v1.0/docentes/mis-cursos/:curso/examenes Lista de examenes - Docentes
     * @apiDescription Retorna los examenes asociadas a un curso de un docente.
     * @apiName retrieve1
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId} materia     Identificador del curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "examenes": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "curso": {
     *                      "_id": "b2bc2187abc8fe8a8dcb7432",
     *                      "comision": 1,
     *                      "docenteACargo": {
     *                          "_id": "5ba715541dabf8854f11e0c0",
     *                          "nombre": "Moises Carlos",
     *                          "apellido": "Fontela"
     *                      }
     *                  },
     *                  "materia": {
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": {
     *                      "_id": "ddbc2187abc8fe8a8dcb7144",
     *                      "sede": "PC",
     *                      "aula": "203"
     *                  },
     *                  "fecha": "2018-12-04T19:00:00.000Z"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7122",
     *                  "curso": {
     *                      "_id": "b2bc2187abc8fe8a8dcb7432",
     *                      "comision": 1,
     *                      "docenteACargo": {
     *                          "_id": "5ba715541dabf8854f11e0c0",
     *                          "nombre": "Moises Carlos",
     *                          "apellido": "Fontela"
     *                      }
     *                  },
     *                  "materia": {
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": null,
     *                  "fecha": "2018-12-11T19:00:00.000Z"
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_PROFESSOR_URL,
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        (req, res) => {
            ExamenService.retrieveExamsByCourse(req.params.curso, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][examenes] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { examenes: result });
                }
            });
        });


    /**
     * @api {post} /api/v1.0/docentes/mis-cursos/:curso/examenes Alta de examen - Docentes
     * @apiDescription Realiza un alta de un examen para un determinado curso
     * @apiName create
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}         curso           Identificador del curso
     * 
     * @apiHeader {String}          token           Token de acceso
     * 
     * @apiParam (Body) {Date}      fecha           Fecha del examen (día y horario)
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "examen": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *              "curso": {
     *                  "_id": "b2bc2187abc8fe8a8dcb7432",
     *                  "comision": 1,
     *                  "docenteACargo": {
     *                      "_id": "5ba715541dabf8854f11e0c0",
     *                      "nombre": "Moises Carlos",
     *                     "apellido": "Fontela"
     *                  }
     *              },
     *              "materia": {
     *                  "codigo": "75.47",
     *                  "nombre": "Taller de Desarrollo de Proyectos II"
     *              },
     *              "aula": null,
     *              "fecha": "2018-12-04T19:00:00.000Z"
     *         }
     *       }
     *     }
     */
    router.post(BASE_PROFESSOR_URL,
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('fecha', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        ExamenService.checkExamCountForCourse(),
        (req, res) => {

            let course_id = req.params.curso;
            let body = req.body;

            ExamenService.createExam(course_id, body, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][crear-examen] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { examen: result });
                }
            });
        });

    /**
     * @api {get} /api/v1.0/docentes/mis-cursos/:curso/examenes/:examen/inscriptos Lista de inscriptos a examen - Docentes
     * @apiDescription Retorna los alumnos inscriptos a un examen
     * @apiName getInscriptos
     * @apiGroup Examenes
     *
     * @apiParam (Query String) {Boolean}  exportar   Opcional para descargar lista de alumnos inscriptos en un archivo csv.
     * @apiParam {ObjectId}         curso   Identificador del curso
     * @apiParam {ObjectId}         examen  Identificador del examen
     * 
     * @apiHeader {String}          token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "inscripciones": [
     *             {    
     *               "_id": "5bcbbdf69be2db250c178fdd",
     *               "alumno": {
     *                  "legajo": 100000,
     *                  "nombre": "Juan",
     *                  "apellido": "Perez",
     *               },
     *               "condicion": "Regular",
     *               "timestamp": "2018-10-20T23:44:54.625Z",
     *             },
     *             ...
     *         ]
     *       }
     *     }
     */
    router.get(BASE_PROFESSOR_URL + '/:examen/inscriptos',
        routes.validateInput('exportar', Constants.VALIDATION_TYPES.Boolean, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        ExamenService.belongsToCourse(),
        (req, res) => {
            let download = (req.query.exportar == 'true');

            ExamenService.retrieveInscriptions(req.params.examen, download, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][examenes][inscriptos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    if (download) {
                        let pathToDownload = result;

                        res.download(pathToDownload, (error) => {
                            if (error)
                                logger.error('[docentes][mis-cursos][curso][examenes][inscriptos][download] '+error);
    
                            fs.unlink(pathToDownload, (error) => {
                                if (error) {
                                    logger.error('[docentes][mis-cursos][curso][examenes][inscriptos][unlink] ' + error);
                                }
                            });
                        });

                    } else {
                        routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                    }
                }
            });
        });


    /**
     * @api {put} /api/v1.0/docentes/mis-cursos/:curso/examenes/:examen Modificación de examen - Docentes
     * @apiDescription Realiza la actualización de una materia
     * @apiName update
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}         curso   Identificador del curso
     * @apiParam {ObjectId}         examen  Identificador del examen
     * 
     * @apiHeader {String}          token   Token de acceso
     * 
     * @apiParam (Body) {Date}      fecha   Fecha del examen (día y horario)
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "examen": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *              "curso": {
     *                  "_id": "b2bc2187abc8fe8a8dcb7432",
     *                  "comision": 1,
     *                  "docenteACargo": {
     *                      "_id": "5ba715541dabf8854f11e0c0",
     *                      "nombre": "Moises Carlos",
     *                     "apellido": "Fontela"
     *                  }
     *              },
     *              "materia": {
     *                  "codigo": "75.47",
     *                  "nombre": "Taller de Desarrollo de Proyectos II"
     *              },
     *              "aula": {
     *                 "_id": "ddbc2187abc8fe8a8dcb7144",
     *                 "sede": "PC",
     *                  "aula": "203"
     *              },
     *              "fecha": "2018-12-04T19:00:00.000Z"
     *         }
     *       }
     *     }
     */
    router.put(BASE_PROFESSOR_URL + '/:examen',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('fecha', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        ExamenService.belongsToCourse(),
        (req, res) => {
            ExamenService.updateExam(req.params.examen, req.body, (error, updated) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][actualizar-examen] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { examen: updated });
                }
            });
        });


    /**
     * @api {delete} /api/v1.0/docentes/mis-cursos/:curso/examenes/:examen Remover Examen - Docentes
     * @apiDescription Remueve una mesa de examen
     * @apiName removeOne
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}     curso   Identificador del curso
     * @apiParam {ObjectId}     examen  Identificador del examen
     * 
     * @apiHeader {String}      token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "examen": {
     *             "_id": "5bc6859be0af97063119956c",
     *             "curso": {
     *                "_id": "5ba718b71dabf8854f11e17e",
     *                "comision": 1,
     *                "docenteACargo": {
     *                   "_id": "5ba715541dabf8854f11e0c0",
     *                   "nombre": "Fernando",
     *                   "apellido": "Acero"
     *                }
     *             },
     *             "materia": {
     *                "_id": "5ba6cdae8b7931ac3e21ddd6",
     *                "codigo": "61.03",
     *                "nombre": "Análisis Matemático II A"
     *             },
     *             "aula": null,
     *             "fecha": "2018-12-11T12:00:00.000Z",
     *          }
     *          "message": "Examen dado de baja."
     *       }
     *     }
     */
    router.delete(BASE_PROFESSOR_URL + '/:examen',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        ExamenService.belongsToCourse(),
        (req, res) => {
            ExamenService.removeExamAndInscriptions(req.params.examen, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][borrar-examen] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { examen: result, message: 'Examen dado de baja.' });
                }
            });
        });
}

module.exports = ExamenRoutes;