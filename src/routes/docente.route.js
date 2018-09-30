const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const DocenteService = require('../services/docente.service');
const CursoService = require('../services/curso.service');
const InscripcionCursoService = require('../services/inscripcion-curso.service');
const logger = require('../utils/logger');

const BASE_URL = '/docentes';

var DocenteRoutes = function (router) {
    /**
     * @api {post} /api/v1.0/docentes/login Login de Docente
     * @apiDescription Autenticación para docentes
     * @apiName Login de Docente
     * @apiGroup Docentes
     *
     * @apiParam (Body) {String} usuario    Identificador del docente
     * @apiParam (Body) {String} password   Contraseña del docente
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
     *          "rol": "docente",
     *          "expiracionToken": "2018-09-22T02:08:25.559Z"
     *       }
     *     }
     */
    router.post(BASE_URL + '/login',
        routes.validateInput('usuario', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.authenticateUser(AuthService.DOCENTE),
        (req, res) => {
            let user = req.context.user;

            AuthService.generateSessionToken(user, AuthService.DOCENTE, (error, result) => {
                if (error) {
                    logger.error('[docentes][login] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });

    /**
     * @api {get} /api/v1.0/docentes/mis-datos Información de Docente
     * @apiDescription Retorna la información de un docente
     * @apiName Información de Docente
     * @apiGroup Docentes
     *
     * @apiHeader {String} token   Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "docente": {
     *              "nombre": "Jorge",
     *              "apellido": "Cornejo",
     *              "dni": "1111111"
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-datos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        (req, res) => {
            let user = req.context.user;

            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { docente: user });
        });


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
     *               }
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
     * @api {get} /api/v1.0/docentes/mis-cursos/:curso Detalle de un Curso de un Docente
     * @apiDescription Retorna los cursos asignados a un docente
     * @apiName Información de Cursos de un Docente
     * @apiGroup Docentes
     *
     * @apiParam {String}   curso   Identificador del curso
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
     *                           "5ba5e6096243a19278581ff4",
     *                           "5ba5e6096243a19278581ff6"
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
     *                           "5ba5e6096243a19278581ff4",
     *                           "5ba5e6096243a19278581ff6"
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
     */
    router.get(BASE_URL + '/mis-cursos/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        CursoService.loadCourseInfo(),
        CursoService.belongsToProfessor(),
        (req, res) => {

            DocenteService.retrieveCourseDetail(req.params.curso, (error, result) => {
                if (error) {
                    logger.error('[docentes][mis-cursos][curso] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
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
     * @api {post} /api/v1.0/docentes/logout Logout de Docente
     * @apiDescription Cierre de sesión
     * @apiName Logut de Docente
     * @apiGroup Docentes
     *
     * @apiHeader {String} token    Identificador del docente
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Sesión cerrada."
     *       }
     *     }
     */
    router.post(BASE_URL + '/logout',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.logout(),
        (req, res) => {
            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { message: 'Sesión cerrada.' });
        });
}

module.exports = DocenteRoutes;