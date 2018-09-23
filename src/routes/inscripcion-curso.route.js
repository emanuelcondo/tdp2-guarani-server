const routes = require('./routes');
const Constants = require('../utils/constants');
const InscripcionCursoService = require('../services/inscripcion-curso.service');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

const BASE_URL = '/inscripciones';

var InscripcionRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/inscripciones/cursos Lista de inscripciones a cursos
     * @apiDescription Retorna las inscripciones a cursos de un alumno
     * @apiName retrieve4
     * @apiGroup InscripcionesCurso
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "inscripciones": [
     *               {
     *                   "timestamp": "2018-09-23T15:00:00.321Z",
     *                   "_id": "5ba7b0b7868ab64d61e881bd",
     *                   "alumno": "5ba7af6f868ab64d61e88160",
     *                   "curso": {
     *                       "ayudantes": [],
     *                       "cursada": [
     *                           {
     *                               "aula": "201",
     *                               "tipo": "Teórica Obligatoria",
     *                               "dia": "Martes",
     *                               "horario_desde": "15:00",
     *                               "horario_hasta": "17:00"
     *                           },
     *                           {
     *                               "aula": "201",
     *                               "tipo": "Práctica Obligatoria",
     *                               "dia": "Martes",
     *                               "horario_desde": "17:00",
     *                               "horario_hasta": "19:00"
     *                           },
     *                           {
     *                               "aula": "201",
     *                               "tipo": "Teórica Obligatoria",
     *                               "dia": "Jueves",
     *                               "horario_desde": "15:00",
     *                               "horario_hasta": "17:00"
     *                           },
     *                           {
     *                               "aula": "201",
     *                               "tipo": "Práctica Obligatoria",
     *                               "dia": "Jueves",
     *                               "horario_desde": "17:00",
     *                               "horario_hasta": "19:00"
     *                           }
     *                       ],
     *                       "_id": "5ba71ae11dabf8854f11e1d2",
     *                       "comision": 1,
     *                       "materia": "5ba6cf168b7931ac3e21de29",
     *                       "sede": {
     *                           "_id": "5ba5e1d21d4ab5561d4185bf",
     *                           "codigo": "PC",
     *                           "nombre": "Paseo Colón",
     *                           "__v": 0
     *                       },
     *                       "docenteACargo": {
     *                           "_id": "5ba715541dabf8854f11e0c0",
     *                           "nombre": "Fernando",
     *                           "apellido": "Acero"
     *                       },
     *                       "jtp": null
     *                   },
     *                   "materia": {
     *                       "_id": "5ba6cf168b7931ac3e21de29",
     *                       "codigo": "61.08",
     *                       "subcodigo": "08",
     *                       "nombre": "Álgebra II A",
     *                       "creditos": 8,
     *                       "departamento": "5ba6d19e8b7931ac3e21dec5"
     *                   },
     *                   "condicion": "Regular"
     *                },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/cursos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            let user_id = req.context.user._id;
            InscripcionCursoService.retrieveMyRegisters(user_id, (error, result) => {
                if (error) {
                    logger.error('[inscripciones][cursos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { inscripciones: result });
                }
            });
        });

    /**
     * @api {get} /api/v1.0/inscripciones/cursos/:curso Inscripción a curso
     * @apiDescription Retorna el detalle de una inscripción a un curso
     * @apiName retrieve3
     * @apiGroup InscripcionesCurso
     * 
     * @apiParam {ObjectId} curso   Identificador de la inscripción a un curso
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
    router.get(BASE_URL + '/cursos/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });


    /**
     * @api {post} /api/v1.0/inscripciones/cursos/:curso Inscripción a curso
     * @apiDescription Inscripción a un curso de un alumno
     * @apiName retrieve2
     * @apiGroup InscripcionesCurso
     *
     * @apiParam {ObjectId} curso   Identificador del curso
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
    router.post(BASE_URL + '/cursos/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });


    /**
     * @api {delete} /api/v1.0/inscripciones/cursos/:curso Baja de curso
     * @apiDescription Realiza la baja de un alumno anotado en un curso
     * @apiName create1
     * @apiGroup InscripcionesCurso
     *
     * @apiParam {ObjectId} curso       Identificador del curso
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
    router.delete(BASE_URL + '/cursos/:curso',
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { inscripcion: {} });
        });

}

module.exports = InscripcionRoutes;