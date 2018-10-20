const routes = require('./routes');
const Constants = require('../utils/constants');
const InscripcionExamenService = require('../services/inscripcion-examen.service');
const ExamenService = require('../services/examen.service');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

const BASE_URL = '/inscripciones';

var InscripcionRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/inscripciones/examenes Lista de inscripciones a examenes
     * @apiDescription Retorna las inscripciones a examenes de un alumno
     * @apiName retrieve1
     * @apiGroup InscripcionesExamen
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "inscripciones": [
     *              {
     *                  "_id": "f23c21b7abc8fe8abcbb7121",
     *                  "examen": {
     *                      "_id": "a2bc2187abc8fe8a8dcb7121",
     *                      "curso": {
     *                          "_id": "b2bc2187abc8fe8a8dcb7432",
     *                          "comision": 1,
     *                          "docenteACargo": {
     *                              "_id": "5ba715541dabf8854f11e0c0",
     *                              "nombre": "Moises Carlos",
     *                              "apellido": "Fontela"
     *                          }
     *                      },
     *                      "materia": {
     *                          "codigo": "75.47",
     *                          "nombre": "Taller de Desarrollo de Proyectos II"
     *                      },
     *                      "aula": {
     *                          "_id": "ddbc2187abc8fe8a8dcb7144",
     *                          "sede": "PC",
     *                          "aula": "203"
     *                      },
     *                      "fecha": "2018-12-04T19:00:00.000Z"
     *                  },
     *                  "alumno": "ffff2187abc8fe8a8dcbaaaa",
     *                  "condicion": "Regular",
     *                  "timestamp": "2018-09-01T14:15:23.000Z"
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/examenes',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            let user_id = req.context.user._id;
            logger.info('examenes ' + user_id);
            InscripcionExamenService.retrieveMyExamInscriptions(user_id, (error, result) => {
                if (error) {
                    logger.error('[inscripciones][examenes] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { inscripciones: result });
                }
            });
    });

    /**
     * @api {get} /api/v1.0/inscripciones/:inscripcion/examenes Detalle de inscripción a examen
     * @apiDescription Retorna el detalle de una inscripción a un examen
     * @apiName retrieve2
     * @apiGroup InscripcionesExamen
     * 
     * @apiParam {ObjectId} inscripcion  Identificador de la inscripción a un examen
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "inscripcion": {
     *              "_id": "f23c21b7abc8fe8abcbb7121",
     *              "examen": {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "curso": {
     *                     "_id": "b2bc2187abc8fe8a8dcb7432",
     *                     "comision": 1,
     *                     "docenteACargo": {
     *                        "_id": "5ba715541dabf8854f11e0c0",
     *                        "nombre": "Moises Carlos",
     *                        "apellido": "Fontela"
     *                     }
     *                  },
     *                  "materia": {
     *                     "codigo": "75.47",
     *                     "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": {
     *                     "_id": "ddbc2187abc8fe8a8dcb7144",
     *                     "sede": "PC",
     *                     "aula": "203"
     *                  },
     *                  "fecha": "2018-12-04T19:00:00.000Z"
     *              },
     *              "alumno": "ffff2187abc8fe8a8dcbaaaa",
     *              "condicion": "Regular",
     *              "timestamp": "2018-09-01T14:15:23.000Z"
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/:inscripcion/examenes',
        routes.validateInput('inscripcion', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });


    /**
     * @api {post} /api/v1.0/inscripciones/examenes/:examen Inscripción a examen
     * @apiDescription Inscripción a un examen de un alumno
     * @apiName retrieve3
     * @apiGroup InscripcionesExamen
     *
     * @apiParam {ObjectId} examen  Identificador del examen
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "inscripcion": {
     *              "_id": "f23c21b7abc8fe8abcbb7121",
     *              "examen": {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "curso": {
     *                     "_id": "b2bc2187abc8fe8a8dcb7432",
     *                     "comision": 1,
     *                     "docenteACargo": {
     *                        "_id": "5ba715541dabf8854f11e0c0",
     *                        "nombre": "Moises Carlos",
     *                        "apellido": "Fontela"
     *                     }
     *                  },
     *                  "materia": {
     *                     "codigo": "75.47",
     *                     "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "aula": {
     *                     "_id": "ddbc2187abc8fe8a8dcb7144",
     *                     "sede": "PC",
     *                     "aula": "203"
     *                  },
     *                  "fecha": "2018-12-04T19:00:00.000Z"
     *              },
     *              "alumno": "ffff2187abc8fe8a8dcbaaaa",
     *              "condicion": "Regular",
     *              "timestamp": "2018-09-01T14:15:23.000Z"
     *          }
     *       }
     *     }
     */
    router.post(BASE_URL + '/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        ExamenService.loadExamInfo(),
        InscripcionExamenService.allowOnlyOneExamInscription(),
        (req, res) => {
            let user = req.context.user;
            let exam = req.context.exam;

            InscripcionExamenService.createExamInscription(user, exam, (error, result) => {
                if (error) {
                    logger.error('[inscripciones][examen][:examen][crear inscripcion a examen] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { inscripcion: result });
                }
            });
        });


    /**
     * @api {delete} /api/v1.0/inscripciones/:inscripcion/examenes Baja de examen
     * @apiDescription Realiza la baja de un alumno anotado en un examen
     * @apiName create4
     * @apiGroup InscripcionesExamen
     *
     * @apiParam {ObjectId} inscripcion      Identificador de la inscripción a examen
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "message": "Usted se ha dado de baja de este examen."
     *       }
     *     }
     */
    router.delete(BASE_URL + '/:inscripcion/examenes',
        routes.validateInput('inscripcion', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });

}

module.exports = InscripcionRoutes;