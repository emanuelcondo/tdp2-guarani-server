const routes = require('./routes');
const Constants = require('../utils/constants');

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
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripciones: [] });
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
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
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