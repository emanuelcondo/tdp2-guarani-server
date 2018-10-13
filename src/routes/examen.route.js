const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/materias/:materia/examenes';

var ExamenRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/:materia/examenes Lista de examenes
     * @apiDescription Retorna los examenes asociadas a una materia
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
     *                  "aula": {
     *                      "_id": "ddbc2187abc8fe8a8dcb7144",
     *                      "sede": "PC",
     *                      "aula": "203"
     *                  },
     *                  "fecha": "2018-12-11T19:00:00.000Z"
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { examenes: [] });
        });


    /**
     * @api {post} /api/v1.0/materias/:materia/examenes Alta de examen
     * @apiDescription Realiza un alta de un examen asociado a una materia de un determinado curso
     * @apiName create
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}         materia         Identificador de la materia
     * 
     * @apiHeader {String}          token           Token de acceso
     * 
     * @apiParam (Body) {ObjectId}  curso           Identificador del curso
     * @apiParam (Body) {ObjectId}  aula            Identificador del aula
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
    router.post(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { examen: {} });
        });


    /**
     * @api {get} /api/v1.0/examenes/:examen Información de examen
     * @apiDescription Retorna la información de un examen
     * @apiName retrieveOne
     * @apiGroup Examenes
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
    router.get('/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { examen: {} });
        });


    /**
     * @api {put} /api/v1.0/examenes/:examen Modificación de examen
     * @apiDescription Realiza la actualización de una materia
     * @apiName update
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}         examen  Identificador del examen
     * 
     * @apiHeader {String}          token   Token de acceso
     * 
     * @apiParam (Body) {ObjectId}  aula            Identificador del aula
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
    router.put('/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { examen: {} });
        });


    /**
     * @api {delete} /api/v1.0/examenes/:examen Remover Examen
     * @apiDescription Remueve una mesa de examen
     * @apiName removeOne
     * @apiGroup Examenes
     *
     * @apiParam {ObjectId}     examen  Identificador del examen
     * 
     * @apiHeader {String}      token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Examen dado de baja."
     *       }
     *     }
     */
    router.delete('/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Materia dada de baja.' });
        });
}

module.exports = ExamenRoutes;