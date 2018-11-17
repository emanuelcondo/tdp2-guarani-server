const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const CursoService = require('../services/curso.service');
const logger = require('../utils/logger');

const BASE_URL = '/materias/:materia/cursos';

const DIAS_ENUM = [ "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ];

const CURSADA_ENUM = [
    "Teórica", "Teórica Obligatoria",
    "Práctica", "Práctica Obligatoria",
    "Teórica Práctica", "Teórica Práctica Obligatoria",
    "Desarrollo y Consultas",
];

const SEDE_ENUM = [ 'CU', 'LH', 'PC', null ];
const REGEX_HORARIO = /^([01]\d|2[0-3]):?([0-5]\d)$/;

var CursoRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/:materia/cursos Lista de cursos
     * @apiDescription Retorna los cursos asociados a una materia
     * @apiName retrieve
     * @apiGroup Cursos
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
     *          "cursos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "comision": 1,
     *                  "anio": 2018,
     *                  "cuatrimestre": 2,
     *                  "cupos": 30,
     *                  "vacantes": 30,
     *                  "materia": {
     *                      "codigo": "7547",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "docenteACargo": {
     *                      "nombre": "Moises Carlos",
     *                      "apellido": "Fontela"
     *                  },
     *                  "jtp": {
     *                      "nombre": "Alejandro Gustavo",
     *                      "apellido": "Molinari"
     *                  },
     *                  "ayudantes": [
     *                      {
     *                          "nombre": "Marcio",
     *                          "apellido": "Degiovannini"
     *                      },
     *                      ...
     *                  ],
     *                  "cursada": [
     *                      {
     *                          "aula": "302",
     *                          "sede": "PC",
     *                          "tipo": "Práctica",
     *                          "dia": "Lunes",
     *                          "horario_desde": "17:00",
     *                          "horario_hasta": "19:00",
     *                      },
     *                      {
     *                          "aula": "319",
     *                          "sede": "PC",
     *                          "tipo": "Práctica",
     *                          "dia": "Lunes",
     *                          "horario_desde": "19:00",
     *                          "horario_hasta": "23:00",
     *                      }
     *                  ]
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            CursoService.retrieveCoursesBySubject(req.params.materia, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { cursos: result });
                }
            });
        });


    /**
     * @api {post} /api/v1.0/materias/:materia/cursos Alta de curso
     * @apiDescription Realiza un alta de curso asociado a una materia (ver POST Request)
     * @apiName create
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Integer}       anio            Año del ciclo lectivo
     * @apiParam (Body) {Integer}       cuatrimestre    Cuatrimestre del ciclo lectivo
     * @apiParam (Body) {Integer}       cupos           Cupos para el curso
     * @apiParam (Body) {ObjectId}      [docenteACargo] Identificador del docente a cargo
     * @apiParam (Body) {ObjectId}      [jtp]           Identificador del jtp
     * @apiParam (Body) {ObjectId[]}    [ayudantes]     Identificadores de los ayudantes
     * @apiParam (Body) {Object[]}      [cursada]       Información sobre la cursada (ver POST Request)
     * 
     * @apiSuccessExample {json} POST Request:
     *     POST /api/v1.0/materias/a2bc2187abc8fe8a8dcb7121/cursos
     *     {
     *        "comision": 1,
     *        "anio": 2018,
     *        "cuatrimestre": 2,
     *        "cupos": 30,
     *        "docenteACargo": "a2bc2187abc8fe8a8dcb7122",
     *        "jtp": "a2bc2187abc8fe8a8dcb7123",
     *        "ayudantes": [
     *          "a2bc2187abc8fe8a8dcb7124",
     *          "a2bc2187abc8fe8a8dcb7125"
     *        ],
     *        "cursada": [
     *           {
     *              "aula": "302",
     *              "sede": "PC",
     *              "tipo": "Práctica",
     *              "dia": "Lunes",
     *              "horario_desde": "17:00",
     *              "horario_hasta": "19:00",
     *           },
     *           {
     *              "aula": "302",
     *              "sede": "PC",
     *              "tipo": "Práctica",
     *              "dia": "Lunes",
     *              "horario_desde": "19:00",
     *              "horario_hasta": "23:00",
     *           }
     *        ]
     *     }
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "anio": 2018,
     *             "cuatrimestre": 2,
     *             "cupos": 30,
     *             "vacantes": 30,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [
     *                 {
     *                     "nombre": "Marcio",
     *                     "apellido": "Degiovannini"
     *                 },
     *                 ...
     *             ],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.post(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('anio', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cupos', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cuatrimestre', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('docenteACargo', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('jtp', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('ayudantes.$', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('cursada.$.aula', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('cursada.$.sede', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL, { allowed_values: SEDE_ENUM }),
        routes.deepInputValidation('cursada.$.tipo', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { allowed_values: CURSADA_ENUM }),
        routes.deepInputValidation('cursada.$.dia', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { allowed_values: DIAS_ENUM }),
        routes.deepInputValidation('cursada.$.horario_desde', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { regex: REGEX_HORARIO }),
        routes.deepInputValidation('cursada.$.horario_hasta', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { regex: REGEX_HORARIO }),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        (req, res) => {
            req.body.materia = req.params.materia;

            CursoService.createCourse(req.body, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos][crear] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { curso: result });
                }
            });
        });


    /**
     * @api {get} /api/v1.0/materias/:materia/cursos/:curso Información de curso
     * @apiDescription Retorna la información de un curso
     * @apiName retrieveOne
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * @apiParam {ObjectId} curso       Identificador del curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "anio": 2018,
     *             "cuatrimestre": 2,
     *             "cupos": 30,
     *             "vacantes": 30,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [
     *                 {
     *                     "nombre": "Marcio",
     *                     "apellido": "Degiovannini"
     *                 },
     *                 ...
     *             ],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.get(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        CursoService.belongsToAsignature(),
        (req, res) => {
            CursoService.retrieveOne(req.params.curso, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos][retrieve-one] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!result) {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Curso con id '+req.params.curso+' no encontrado.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { curso: result });
                }
            });
        });


    /**
     * @api {put} /api/v1.0/materias/:materia/cursos/:curso Modificación de curso
     * @apiDescription Realiza un update de curso asociado a una materia (ver PUT Request)
     * @apiName update
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * @apiParam {ObjectId} curso       Identificador del curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Integer}       cupos           Cupos para el curso
     * @apiParam (Body) {ObjectId}      [docenteACargo] Identificador del docente a cargo
     * @apiParam (Body) {ObjectId}      [jtp]           Identificador del jtp
     * @apiParam (Body) {ObjectId[]}    [ayudantes]     Identificadores de los ayudantes
     * @apiParam (Body) {Object[]}      [cursada]       Información sobre la cursada (ver POST Request)
     * 
     * @apiSuccessExample {json} PUT Request:
     *     PUT /api/v1.0/materias/a2bc2187abc8fe8a8dcb7121/cursos/a2bc2187abc8fe8a8dcb7121
     *     {
     *        "anio": 2018,
     *        "cuatrimestre": 2,
     *        "cupos": 30,
     *        "docenteACargo": "a2bc2187abc8fe8a8dcb7122",
     *        "jtp": "a2bc2187abc8fe8a8dcb7123",
     *        "ayudantes": [],
     *        "cursada": [
     *           {
     *              "aula": "302",
     *              "sede": "PC",
     *              "tipo": "Práctica",
     *              "dia": "Lunes",
     *              "horario_desde": "17:00",
     *              "horario_hasta": "19:00",
     *           },
     *           {
     *              "aula": "302",
     *              "sede": "PC",
     *              "tipo": "Práctica",
     *              "dia": "Lunes",
     *              "horario_desde": "19:00",
     *              "horario_hasta": "23:00",
     *           }
     *        ]
     *     }
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "anio": 2018,
     *             "cuatrimestre": 2,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "sede": "PC",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.put(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cupos', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('docenteACargo', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('jtp', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('ayudantes.$', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('cursada.$.aula', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL),
        routes.deepInputValidation('cursada.$.sede', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_OPTIONAL, { allowed_values: SEDE_ENUM }),
        routes.deepInputValidation('cursada.$.tipo', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { allowed_values: CURSADA_ENUM }),
        routes.deepInputValidation('cursada.$.dia', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { allowed_values: DIAS_ENUM }),
        routes.deepInputValidation('cursada.$.horario_desde', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { regex: REGEX_HORARIO }),
        routes.deepInputValidation('cursada.$.horario_hasta', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { regex: REGEX_HORARIO }),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        CursoService.belongsToAsignature(),
        (req, res) => {

            CursoService.updateCourse(req.params.curso, req.body, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos][update] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!result) {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Curso con id '+req.params.curso+' no encontrado.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { curso: result });
                }
            });
        });


    /**
     * @api {delete} /api/v1.0/materias/:materia/cursos/:curso Remover curso
     * @apiDescription Remueve un curso
     * @apiName removeOne
     * @apiGroup Cursos
     *
     * @apiParam {String}   materia Identificador de la materia (ObjectId)
     * @apiParam {String}   curso   Identificador del curso (ObjectId)
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Curso dado de baja."
     *       }
     *     }
     */
    router.delete(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        CursoService.belongsToAsignature(),
        (req, res) => {
            CursoService.removeCourse(req.params.curso, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos][remove] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!result) {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Curso con id '+req.params.curso+' no encontrado.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { message: 'Curso dado de baja.' });
                }
            });
        });
}

module.exports = CursoRoutes;