const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/inscripciones';

var InscripcionRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/inscripciones/examenes Lista de inscripciones a examenes
     * @apiDescription Retorna las inscripciones a examenes de un alumno
     * @apiName retrieve
     * @apiGroup Inscripciones
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
     *                  "curso": "a2bc2187abc8fe8a8dcb7121",
     *                  "alumno": "ffff2187abc8fe8a8dcbaaaa",
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
     * @api {get} /api/v1.0/inscripciones/examenes/:examen Detalle de inscripción a examen
     * @apiDescription Retorna el detalle de una inscripción a un examen
     * @apiName retrieve
     * @apiGroup Inscripciones
     * 
     * @apiParam {ObjectId} examen  Identificador de la inscripción a un examen
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
     *              "curso": "a2bc2187abc8fe8a8dcb7121",
     *              "alumno": "ffff2187abc8fe8a8dcbaaaa",
     *              "timestamp": "2018-09-01T14:15:23.000Z"
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });


    /**
     * @api {post} /api/v1.0/inscripciones/examenes/:examen Inscripción a examen
     * @apiDescription Inscripción a un examen de un alumno
     * @apiName retrieve
     * @apiGroup Inscripciones
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
     *              "curso": "a2bc2187abc8fe8a8dcb7121",
     *              "alumno": "ffff2187abc8fe8a8dcbaaaa",
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
     * @api {delete} /api/v1.0/inscripciones/examenes/:examen Baja de examen
     * @apiDescription Realiza la baja de un alumno anotado en un curso
     * @apiName create
     * @apiGroup Inscripciones
     *
     * @apiParam {ObjectId} examen      Identificador del examen
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "inscripcion": {
     *             "_id": "f23c21b7abc8fe8abcbb7121",
     *             "curso": "a2bc2187abc8fe8a8dcb7121",
     *             "alumno": "ffff2187abc8fe8a8dcbaaaa"
     *         }
     *       }
     *     }
     */
    router.delete(BASE_URL + '/examenes/:examen',
        routes.validateInput('examen', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });

}

module.exports = InscripcionRoutes;