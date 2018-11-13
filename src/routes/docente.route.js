const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const DocenteService = require('../services/docente.service');
const CursoService = require('../services/curso.service');
const InscripcionCursoService = require('../services/inscripcion-curso.service');
const logger = require('../utils/logger');
const fs = require('fs');

const BASE_URL = '/docentes';

var DocenteRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/docentes/mis-cursos Lista de Cursos de un Docente
     * @apiDescription Retorna los cursos asignados a un docente
     * @apiName Lista de Cursos de un Docente
     * @apiGroup Docentes
     *
     * @apiHeader {String} token   Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *           "cursos": [
     *              {
     *               "ayudantes": [
     *                   {
     *                       "_id": "5ba6dcfe8b7931ac3e21e450",
     *                       "nombre": "Marcio",
     *                       "apellido": "Degiovannini",
     *                       "__v": 0
     *                   }
     *               ],
     *               "cursada": [
     *                   {
     *                       "aula": "302",
     *                       "tipo": "Teórica Obligatoria",
     *                       "dia": "Lunes",
     *                       "horario_desde": "17:00",
     *                       "horario_hasta": "19:00"
     *                   },
     *                   {
     *                       "aula": "319",
     *                       "tipo": "Práctica Obligatoria",
     *                       "dia": "Lunes",
     *                       "horario_desde": "19:00",
     *                       "horario_hasta": "23:00"
     *                   }
     *               ],
     *               "_id": "5ba6de738b7931ac3e21e4d6",
     *               "comision": 1,
     *               "materia": {
     *                   "_id": "5ba70ab61dabf8854f11dec6",
     *                   "codigo": "75.47",
     *                   "subcodigo": "47",
     *                   "nombre": "Taller de Desarrollo de Proyectos II",
     *                   "creditos": 6,
     *                   "departamento": "5ba6d0d58b7931ac3e21de8c"
     *               },
     *               "sede": {
     *                   "_id": "5ba5e1d21d4ab5561d4185bf",
     *                   "codigo": "PC",
     *                   "nombre": "Paseo Colón",
     *                   "__v": 0
     *               },
     *               "docenteACargo": {
     *                   "_id": "5ba5df611cc1ac5580f07713",
     *                   "nombre": "Moises Carlos",
     *                   "apellido": "Fontela",
     *                   "__v": 0
     *               },
     *               "jtp": {
     *                   "_id": "5ba6dcfe8b7931ac3e21e44e",
     *                   "nombre": "Alejandro",
     *                   "apellido": "Molinari",
     *                   "__v": 0
     *               },
     *               "cantidadInscriptos": 10
     *           },
     *           ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-cursos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        (req, res) => {
            let user_id = req.context.user._id;

            DocenteService.retrieveMyCourses(user_id, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { cursos: result });
                }
            });
        });


    /**
     * @api {get} /api/v1.0/docentes/mis-cursos/:curso?exportar=true Detalle de un Curso de un Docente
     * @apiDescription Retorna los cursos asignados a un docente
     * @apiName Información de Cursos de un Docente
     * @apiGroup Docentes
     *
     * @apiParam {String}   curso   Identificador del curso
     * 
     * @apiParam (Query String) {Boolean}  exportar   Opcional para descargar lista de alumnos (regulares y condicionales) en un archivo csv.
     * 
     * @apiHeader {String}  token   Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "curso": {
     *              "_id": "5ba6de738b7931ac3e21e4d6",
     *              "comision": 1,
     *              "materia": {
     *                  "_id": "5ba705601dabf8854f11ddfd",
     *                  "codigo": "75.41",
     *                  "subcodigo": "41",
     *                  "nombre": "Alogirtmos y Programación II",
     *                  "creditos": 6,
     *                  "departamento": "5ba6d0d58b7931ac3e21de8c"
     *              },
     *              ....
     *          },
     *          "regulares": [
     *               {
     *                   "timestamp": "2018-09-23T15:00:00.321Z",
     *                   "_id": "5ba7b0b7868ab64d61e881c3",
     *                   "alumno": {
     *                       "carreras": [
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff4",
     *                              "codigo": 9,
     *                              "nombre": "Licenciatura en Análisis de Sistemas"
     *                          },
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff6",
     *                              "codigo": 10,
     *                              "nombre": "Ingeniería en Informática"
     *                          }
     *                       ],
     *                       "_id": "5ba7af6f868ab64d61e88160",
     *                       "legajo": 100000,
     *                       "nombre": "Juan",
     *                       "apellido": "Perez",
     *                       "prioridad" : 7
     *                       "__v": 0
     *                   },
     *                   "curso": null,
     *                   "materia": "5ba705601dabf8854f11ddfd",
     *                   "condicion": "Regular"
     *               },
     *               ...
     *          ],
     *          "condicionales": [
     *               {
     *                   "timestamp": "2018-09-23T15:00:00.321Z",
     *                   "_id": "5ba7b0b7868ab64d61e881c3",
     *                   "alumno": {
     *                       "carreras": [
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff4",
     *                              "codigo": 9,
     *                              "nombre": "Licenciatura en Análisis de Sistemas"
     *                          },
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff6",
     *                              "codigo": 10,
     *                              "nombre": "Ingeniería en Informática"
     *                          }
     *                       ],
     *                       "_id": "5ba7af6f868ab64d61e88160",
     *                       "legajo": 100001,
     *                       "nombre": "John",
     *                       "apellido": "Doe",
     *                       "prioridad" : 71
     *                       "__v": 0
     *                   },
     *                   "curso": null,
     *                   "materia": "5ba705601dabf8854f11ddfd",
     *                   "condicion": "Condicional"
     *               },
     *               ...
     *          ]
     *       }
     *     }
     * 
     * @apiSuccessExample {text} Exportar alumnos:
     * HTTP/1.1 200 OK
     * 
     * Padrón,Nombres,Apellidos,Carreras,Prioridad,Condición
     * 100000,Juan,Peréz,"[Licenciatura en Análisis de Sistemas, Ingeniería en Informática]",5,Regular
     * 100001,Juan Manuel,Gonzalez,"[Ingeniería en Informática]",2,Regular
     * 100002,Martin,Cura Coronel,"[Licenciatura en Análisis de Sistemas]",1,Regular
     * 100003,Cristian,Bert,"[Ingeniería en Informática]",50,Condicional
     * ...
     * 
     */
    router.get(BASE_URL + '/mis-cursos/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('exportar', Constants.VALIDATION_TYPES.Boolean, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        (req, res) => {
            let download = (req.query.exportar == 'true');

            DocenteService.retrieveCourseDetail(req.params.curso, download, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    if (download) {
                        let pathToDownload = result;

                        res.download(pathToDownload, (error) => {
                            if (error)
                                logger.error('[docentes][mis-cursos][curso][exportar-alumnos][download] '+error);
    
                            fs.unlink(pathToDownload, (error) => {
                                if (error) {
                                    logger.error('[docentes][mis-cursos][curso][exportar-alumnos][unlink] ' + error);
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
     * @api {get} /api/v1.0/docentes/mis-cursos/:curso/inscribir-alumnos Aceptar Alumnos Condicionales
     * @apiDescription Inscribe alumnos condiciones como regulares a un curso de un docente
     * @apiName Aceptar Alumnos Condicionales
     * @apiGroup Docentes
     *
     * @apiParam {String}   curso   Identificador del curso
     * 
     * @apiHeader {String}  token   Token de sesión
     * 
     * @apiParam (Body) {ObjectId[]}  alumnos   Identificadores de alumnos condicionales a la materia asociada con el curso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "regulares": [
     *               {
     *                   "timestamp": "2018-09-23T15:00:00.321Z",
     *                   "_id": "5ba7b0b7868ab64d61e881c3",
     *                   "alumno": {
     *                       "carreras": [
     *                           "5ba5e6096243a19278581ff4",
     *                           "5ba5e6096243a19278581ff6"
     *                       ],
     *                       "_id": "5ba7af6f868ab64d61e88160",
     *                       "legajo": 100000,
     *                       "nombre": "Juan",
     *                       "apellido": "Perez",
     *                       "__v": 0
     *                   },
     *                   "curso": "5ba71ae11dabf8854f11e1d2",
     *                   "materia": "5ba705601dabf8854f11ddfd",
     *                   "condicion": "Regular",
     *                   "exCondicional": true
     *               },
     *               ...
     *          ]
     *       }
     *     }
     * 
     * @apiSuccessExample {json} Notificación para la App:
     *
     *     {
     *       "title": "61.08 - curso 1 - Condicionales",
     *       "body": "Has sido inscripto como alumno regular en el curso 1 de la materia (61.08) Algebra II A."
     *     }
     */
    router.post(BASE_URL + '/mis-cursos/:curso/inscribir-alumnos',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('alumnos', Constants.VALIDATION_TYPES.Array, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        InscripcionCursoService.checkConditionalStudents(),
        (req, res) => {
            let students = req.body.alumnos;
            let course = req.context.course;

            DocenteService.registerConditionalStudents(course, students, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][inscribir condicionales] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { regulares: result });
                }
            });
        });

    /**
     * @api {get} /api/v1.0/docentes?search=<text> Lista de docentes
     * @apiDescription Retorna todas los docentes activos
     * @apiName retrieveAll
     * @apiGroup Docentes
     * 
     * @apiParam (Query String) {String}  search       Texto para filtrar búsquedas
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "docentes": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "nombre": "Jorge",
     *                  "apellido": "Cornejo"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7122",
     *                  "nombre": "Marcio",
     *                  "apellido": "Degiovannini"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7123",
     *                  "nombre": "Moisés Carlos",
     *                  "apellido": "Fontela"
     *              },        
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('search', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        (req, res) => {

            DocenteService.retrieveAll({ search: req.query.search }, (error, result) => {
                if (error) {
                    logger.error('[docentes][retrieve-all] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { docentes: result });
                }
            });
        });

    /**
     * @api {post} /api/v1.0/docentes/mis-cursos/:curso/cargar-notas Carga de Notas Cursada
     * @apiDescription Carga de notas de alumnos inscriptos en tal curso.
     * @apiName updatee
     * @apiGroup Docentes
     * 
     * @apiParam {String}   curso   Identificador del curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Object[]}  alumnos       Lista de alumnos con sus respectivas notas (ver POST Request)
     * 
     * @apiSuccessExample {json} POST Request:
     *     POST /api/v1.0/docentes/mis-cursos/a2bc2187abc8fe8a8dcb7121/cargar-notas
     *     {
     *        "alumnos": [
     *            {
     *                "padron": 100000,
     *                "nota": 4
     *            },
     *            {
     *                "padron": 100001,
     *                "nota": 7
     *            },
     *            ...
     *        ]
     *     }
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "curso": {
     *              "_id": "a2bc2187abc8fe8a8dcb7121",
     *              "comision": 1,
     *              "materia": {
     *                  "_id": "5ba705601dabf8854f11ddfd",
     *                  "codigo": "75.41",
     *                  "subcodigo": "41",
     *                  "nombre": "Alogirtmos y Programación II",
     *                  "creditos": 6,
     *                  "departamento": "5ba6d0d58b7931ac3e21de8c"
     *              },
     *              ....
     *          },
     *          "regulares": [
     *               {
     *                   "timestamp": "2018-09-23T15:00:00.321Z",
     *                   "_id": "5ba7b0b7868ab64d61e881c3",
     *                   "alumno": {
     *                       "carreras": [
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff4",
     *                              "codigo": 9,
     *                              "nombre": "Licenciatura en Análisis de Sistemas"
     *                          },
     *                          {
     *                              "_id": "5ba5e6096243a19278581ff6",
     *                              "codigo": 10,
     *                              "nombre": "Ingeniería en Informática"
     *                          }
     *                       ],
     *                       "_id": "a2bc2187abc8fe8a8dcb7000",
     *                       "legajo": 100000,
     *                       "nombre": "Juan",
     *                       "apellido": "Perez",
     *                       "prioridad" : 7
     *                       "__v": 0
     *                   },
     *                   "notaCursada": 7,
     *                   "curso": "a2bc2187abc8fe8a8dcb7121",
     *                   "materia": "5ba705601dabf8854f11ddfd",
     *                   "condicion": "Regular"
     *               },
     *               ...
     *          ]
     *       }
     *     }
     */
    router.post(BASE_URL + '/mis-cursos/:curso/cargar-notas',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('alumnos', Constants.VALIDATION_TYPES.Array, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('alumnos.$.padron', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('alumnos.$.nota', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        (req, res) => {

            DocenteService.updateCourseQualification(req.params.curso, req.body.alumnos, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso][notas-cursada] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });
}

module.exports = DocenteRoutes;