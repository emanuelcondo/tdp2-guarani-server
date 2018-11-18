const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const EncuestaService = require('../services/encuesta.service');
const PeriodoService = require('../services/periodo.service');
const DepartamentoService = require('../services/departamento.service');
const logger = require('../utils/logger');

const BASE_URL = '/encuestas';

const CUATRIMESTRES = [ '0', '1', '2' ];

var EncuestaRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/encuentas Encuestas
     * @apiDescription Retorna todas las encuestas filtradas por departamento y ciclo lectivo.
     * @apiName retrieveEncuestas
     * @apiGroup Encuestas
     *
     * @apiParam (Query String [obligatorios]) {Integer} departamento       Filtro por departamento (61, 62, 75, etc.)
     * @apiParam (Query String [obligatorios]) {Integer} cuatrimestre       Filtro por cuatrimestre (0,1,2)
     * @apiParam (Query String [obligatorios]) {Integer} anio               Filtro por anio (2017, 2018, etc.)
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "encuestas": {
     *              "anio": 2018,
     *              "cuatrimestre": 2,
     *              "departamento": {
     *                  "_id": "a2bc2187abc8fe8a8dcb7000",
     *                  "codigo": 75,
     *                  "nombre": "Departamento de Computación"
     *              },
     *              "materias": [
     *                  {
     *                      "_id": "b2bc2187abc8fe8a8dcb72b2",
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II",
     *                      "puntaje": 9.5,
     *                      "comentarios": [
     *                          "Execelente curso. Totalmente recomendable!!!",
     *                          "Fontela, un crack...desde que lo conozco de Algoritmos III",
     *                          ...
     *                      ]
     *                  },
     *                  {
     *                      "_id": "b2bc2187abc8fe8a8dcb72b3",
     *                      "codigo": "75.12",
     *                      "nombre": "Análisis Numérico I",
     *                      "puntaje": 5.5,
     *                      "comentarios": [
     *                          "La teoría es para dormirse. Práctica recomendable!!!",
     *                          ...
     *                      ]
     *                  },
     *                  ...
     *              ]
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('departamento', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY),
        routes.validateInput('cuatrimestre', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY, { allowed_values: CUATRIMESTRES }),
        routes.validateInput('anio', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        DepartamentoService.loadDepartamentInfo('query'),
        (req, res) => {
            let params = {
                departamento: req.context.departament.codigo,
                cuatrimestre: parseInt(req.query.cuatrimestre),
                anio: parseInt(req.query.anio)
            }

            EncuestaService.generateReport(params, (error, result) => {
                if (error) {
                    logger.error('[encuestas][generate-report] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    let data = {
                        encuestas: {
                            materias: result,
                            cuatrimestre: params.cuatrimestre,
                            anio: params.anio,
                            departamento: {
                                _id: req.context.departament._id,
                                codigo: req.context.departament.codigo,
                                nombre: req.context.departament.nombre
                            }
                        }
                    }
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, data);
                }
            });
        });


    /**
     * @api {get} /api/v1.0/alumnos/mis-encuentas Mis Encuestas (Alumnos)
     * @apiDescription Retorna las encuestas pendientes de los cursos a los cuales el alumno se encuentra inscripto en el período actual.
     * @apiName retrieveMisEncuestas
     * @apiGroup Encuestas
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
     *                  "materia": {
     *                      "_id": "b2bc2187abc8fe8a8dcb72b2",
     *                      "codigo": "75.47",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  }
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7120",
     *                  "comision": 4,
     *                  "anio": 2018,
     *                  "cuatrimestre": 2,
     *                  "materia": {
     *                      "_id": "b2bc2187abc8fe8a8dcb72b3",
     *                      "codigo": "75.12",
     *                      "nombre": "Análisis Numérico I"
     *                  }
     *              }
     *          ]
     *       }
     *     }
     */
    router.get('/alumnos/mis-encuestas',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        PeriodoService.loadCurrentPeriod(),
        (req, res) => {
            let params = {
                alumno: req.context.user._id,
                cuatrimestre: req.context.period.cuatrimestre,
                anio: req.context.period.anio
            }

            EncuestaService.searchPendingSurveysForStudent(params, (error, result) => {
                if (error) {
                    logger.error('[encuestas][alumnos][encuestas-pendientes] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });


    /**
     * @api {post} /api/v1.0/encuestas/curso/:curso Completar Encuesta (Alumnos)
     * @apiDescription Genera un registro sobre un curso al cual el alumno se encuentra inscripto.
     * @apiName createEncuesta
     * @apiGroup Encuestas
     * 
     * @apiParam {ObjectId} curso       Identificador del curso
     * 
     * @apiParam (Body) {Integer} nivel_general  Nivel general del curso (1 a 5)
     * @apiParam (Body) {Integer} nivel_teoricas  Nivel de teóricas del curso (1 a 5)
     * @apiParam (Body) {Integer} nivel_practicas  Nivel de prácticas del curso (1 a 5)
     * @apiParam (Body) {Integer} nivel_temas  Nivel de temas dados del curso (1 a 5)
     * @apiParam (Body) {Integer} nivel_actualizacion  Nivel de actualización de temas del curso (1 a 5)
     * @apiParam (Body) {String} [comentario]  Comentario sobre el curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "La encuesta ha sido completada con éxito."
     *       }
     *     }
     */
    router.post(BASE_URL + '/curso/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('nivel_general', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { min_value: 1, max_value: 5 }),
        routes.validateInput('nivel_teoricas', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { min_value: 1, max_value: 5 }),
        routes.validateInput('nivel_practicas', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { min_value: 1, max_value: 5 }),
        routes.validateInput('nivel_temas', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { min_value: 1, max_value: 5 }),
        routes.validateInput('nivel_actualizacion', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY, { min_value: 1, max_value: 5 }),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        PeriodoService.loadCurrentPeriod(),
        (req, res) => {
            let params = {
                alumno: req.context.user._id,
                curso: req.params.curso,
                periodo: req.context.period,
                body: req.body
            };

            EncuestaService.createSurvey(params, (error, result) => {
                if (error) {
                    logger.error('[encuestas][alumnos][encuestas-pendientes] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!result) {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'El curso con id ' + req.params.curso + ' no fue encontrado en el período actual.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });
}

module.exports = EncuestaRoutes;