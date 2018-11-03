const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const PeriodoService = require('../services/periodo.service');
const logger = require('../utils/logger');

const BASE_URL = '/periodos';

var PeriodoRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/periodos?page=1&limit=20 Períodos
     * @apiDescription Retorna los períodos (actual y anteriores) en orden descendente
     * @apiName retrieve
     * @apiGroup Periodo
     *
     * @apiParam {Integer} [page]       Página a la que se desea acceder (default = 1)
     * @apiParam {Integer} [limit]      Cantidad de períodos por página (default = 20)
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "totalcount": 30,
     *          "totalpages": 2,
     *          "page": 1,
     *          "periodos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "cuatrimestre": 2,
     *                  "anio": 2018,
     *                  "inscripcionCurso": {
     *                      "inicio": "2018-08-03T03:00:00.000Z",
     *                      "fin": "2018-08-08T03:00:00.000Z"
     *                  },
     *                  "desinscripcionCurso": {
     *                      "inicio": "2018-08-10T03:00:00.000Z",
     *                      "fin": "2018-08-15T03:00:00.000Z"
     *                  },
     *                  "cursada": {
     *                      "inicio": "2018-08-17T03:00:00.000Z",
     *                      "fin": "2018-12-03T03:00:00.000Z"
     *                  },
     *                  "consultaPrioridad": {
     *                      "inicio": "2018-07-27T03:00:00.000Z",
     *                      "fin": "2018-12-03T03:00:00.000Z"
     *                  }
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7120",
     *                  "cuatrimestre": 1,
     *                  "anio": 2018,
     *                  "inscripcionCurso": {
     *                      "inicio": "2018-03-03T03:00:00.000Z",
     *                      "fin": "2018-03-08T03:00:00.000Z"
     *                  },
     *                  "desinscripcionCurso": {
     *                      "inicio": "2018-03-10T03:00:00.000Z",
     *                      "fin": "2018-03-15T03:00:00.000Z"
     *                  },
     *                  "cursada": {
     *                      "inicio": "2018-03-17T03:00:00.000Z",
     *                      "fin": "2018-07-03T03:00:00.000Z"
     *                  },
     *                  "consultaPrioridad": {
     *                      "inicio": "2018-02-27T03:00:00.000Z",
     *                      "fin": "2018-07-03T03:00:00.000Z"
     *                  }
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('page', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('limit', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            let params = {
                page: req.query.page,
                limit: req.query.limit
            }

            PeriodoService.searchPeriods(params, (error, result) => {
                if (error) {
                    logger.error('[periodo][search] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });


    /**
     * @api {post} /api/v1.0/periodos Crear Nuevo Período
     * @apiDescription Crea un nuevo período (ver POST Request)
     * @apiName create
     * @apiGroup Periodo
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Integer}   cuatrimestre                Cuatrimestre del ciclo lectivo (verano = 0, primer cuatrimestre = 1, segundo cuatrimestre = 2)
     * @apiParam (Body) {Integer}   anio                        Año del ciclo lectivo
     * @apiParam (Body) {Date}      inscripcionCurso[inicio]     Fecha de inicio para la inscripción a cursos
     * @apiParam (Body) {Date}      inscripcionCurso[fin]        Fecha de fin para la inscripción a cursos
     * @apiParam (Body) {Date}      desinscripcionCurso[inicio]  Fecha de inicio para la desinscripción a cursos
     * @apiParam (Body) {Date}      desinscripcionCurso[fin]     Fecha de fin para la desinscripción a cursos
     * @apiParam (Body) {Date}      cursada[inicio]              Fecha de inicio de cursada
     * @apiParam (Body) {Date}      cursada[fin]                 Fecha de fin de cursada
     * @apiParam (Body) {Date}      consultaPrioridad[inicio]    Fecha de inicio de consulta de prioridad
     * @apiParam (Body) {Date}      consultaPrioridad[fin]       Fecha de fin de consulta de prioridad
     * 
     * @apiSuccessExample {json} POST Request:
     *     POST /api/v1.0/periodos
     *     {
     *        "cuatrimestre": 2,
     *        "anio": 2018,
     *        "inscripcionCurso": {
     *           "inicio": "2018-08-03T03:00:00.000Z",
     *           "fin": "2018-08-08T03:00:00.000Z"
     *        },
     *        "desinscripcionCurso": {
     *            "inicio": "2018-08-10T03:00:00.000Z",
     *            "fin": "2018-08-15T03:00:00.000Z"
     *        },
     *        "cursada": {
     *            "inicio": "2018-08-17T03:00:00.000Z",
     *            "fin": "2018-12-03T03:00:00.000Z"
     *        },
     *        "consultaPrioridad": {
     *            "inicio": "2018-07-27T03:00:00.000Z",
     *            "fin": "2018-12-03T03:00:00.000Z"
     *        }
     *     }
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "periodo": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "cuatrimestre": 2,
     *             "anio": 2018,
     *             "inscripcionCurso": {
     *                 "inicio": "2018-08-03T03:00:00.000Z",
     *                 "fin": "2018-08-08T03:00:00.000Z"
     *             },
     *             "desinscripcionCurso": {
     *                 "inicio": "2018-08-10T03:00:00.000Z",
     *                 "fin": "2018-08-15T03:00:00.000Z"
     *             },
     *             "cursada": {
     *                 "inicio": "2018-08-17T03:00:00.000Z",
     *                 "fin": "2018-12-03T03:00:00.000Z"
     *             },
     *             "consultaPrioridad": {
     *                 "inicio": "2018-07-27T03:00:00.000Z",
     *                 "fin": "2018-12-03T03:00:00.000Z"
     *             }
     *          }
     *       }
     *     }
     */
    router.post(BASE_URL,
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cuatrimestre', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('anio', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('inscripcionCurso.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('inscripcionCurso.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('desinscripcionCurso.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('desinscripcionCurso.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('cursada.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('cursada.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('consultaPrioridad.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('consultaPrioridad.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        PeriodoService.checkPeriodExists(false),
        (req, res) => {

            PeriodoService.createPeriod(req.body, (error, result) => {
                if (error) {
                    logger.error('[periodo][create] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { periodo: result });
                }
            });
        });


    /**
     * @api {put} /api/v1.0/periodos/:periodo Actualizar Período
     * @apiDescription Actualiza un período existente (ver PUT Request)
     * @apiName update
     * @apiGroup Periodo
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Integer}   cuatrimestre                Cuatrimestre del ciclo lectivo (verano = 0, primer cuatrimestre = 1, segundo cuatrimestre = 2)
     * @apiParam (Body) {Integer}   anio                        Año del ciclo lectivo
     * @apiParam (Body) {Date}      inscripcionCurso[inicio]     Fecha de inicio para la inscripción a cursos
     * @apiParam (Body) {Date}      inscripcionCurso[fin]        Fecha de fin para la inscripción a cursos
     * @apiParam (Body) {Date}      desinscripcionCurso[inicio]  Fecha de inicio para la desinscripción a cursos
     * @apiParam (Body) {Date}      desinscripcionCurso[fin]     Fecha de fin para la desinscripción a cursos
     * @apiParam (Body) {Date}      cursada[inicio]              Fecha de inicio de cursada
     * @apiParam (Body) {Date}      cursada[fin]                 Fecha de fin de cursada
     * @apiParam (Body) {Date}      consultaPrioridad[inicio]    Fecha de inicio de consulta de prioridad
     * @apiParam (Body) {Date}      consultaPrioridad[fin]       Fecha de fin de consulta de prioridad
     * 
     * @apiSuccessExample {json} POST Request:
     *     PUT /api/v1.0/periodos
     *     {
     *        "cuatrimestre": 2,
     *        "anio": 2018,
     *        "inscripcionCurso": {
     *           "inicio": "2018-08-03T03:00:00.000Z",
     *           "fin": "2018-08-08T03:00:00.000Z"
     *        },
     *        "desinscripcionCurso": {
     *            "inicio": "2018-08-10T03:00:00.000Z",
     *            "fin": "2018-08-15T03:00:00.000Z"
     *        },
     *        "cursada": {
     *            "inicio": "2018-08-17T03:00:00.000Z",
     *            "fin": "2018-12-03T03:00:00.000Z"
     *        },
     *        "consultaPrioridad": {
     *            "inicio": "2018-07-27T03:00:00.000Z",
     *            "fin": "2018-12-03T03:00:00.000Z"
     *        }
     *     }
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "periodo": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "cuatrimestre": 2,
     *             "anio": 2018,
     *             "inscripcionCurso": {
     *                 "inicio": "2018-08-03T03:00:00.000Z",
     *                 "fin": "2018-08-08T03:00:00.000Z"
     *             },
     *             "desinscripcionCurso": {
     *                 "inicio": "2018-08-10T03:00:00.000Z",
     *                 "fin": "2018-08-15T03:00:00.000Z"
     *             },
     *             "cursada": {
     *                 "inicio": "2018-08-17T03:00:00.000Z",
     *                 "fin": "2018-12-03T03:00:00.000Z"
     *             },
     *             "consultaPrioridad": {
     *                 "inicio": "2018-07-27T03:00:00.000Z",
     *                 "fin": "2018-12-03T03:00:00.000Z"
     *             }
     *          }
     *       }
     *     }
     */
    router.put(BASE_URL + '/:periodo',
        routes.validateInput('periodo', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cuatrimestre', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('anio', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('inscripcionCurso.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('inscripcionCurso.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('desinscripcionCurso.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('desinscripcionCurso.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('cursada.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('cursada.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('consultaPrioridad.inicio', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.deepInputValidation('consultaPrioridad.fin', Constants.VALIDATION_TYPES.Date, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        PeriodoService.checkPeriodExists(true),
        (req, res) => {

            PeriodoService.updatePeriod(req.params.periodo, req.body, (error, result) => {
                if (error) {
                    logger.error('[periodo][update] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!result) {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Período no encontrado' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { periodo: result });
                }
            });
        });
}

module.exports = PeriodoRoutes;