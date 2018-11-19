const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const MateriaService = require('../services/materia.service');
const CarreraService = require('../services/carrera.service');
const PeriodoService = require('../services/periodo.service');
const logger = require('../utils/logger');

const BASE_URL = '/materias';

var MateriaRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/carrera/:carrera Lista de materias
     * @apiDescription Retorna las materias asociadas a una carrera (no las materias a las cuales el alumno ya se encuentra inscripto)
     * @apiName retrieve
     * @apiGroup Materias
     *
     * @apiParam {ObjectId} carrera     Identificador de la carrera
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "materias": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "codigo": "7547",
     *                  "subcodigo": "47",
     *                  "nombre": "Taller de Desarrollo de Proyectos II"
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/carrera/:carrera',
        routes.validateInput('carrera', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        CarreraService.carrerRestricted(),
        PeriodoService.loadCurrentPeriod(),
        (req, res) => {
            let user = req.context.user;
            let checkInscriptions = true;
            let period = req.context.period;

            MateriaService.retrieveSubjectsByCarrer(user, req.params.carrera, checkInscriptions, period, (error, result) => {
                if (error) {
                    logger.error('[materias][carrera][:carrera] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (result) {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { materias: result });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'Carrera no encontrada' });
                }
            });
        });


    /**
     * @api {post} /api/v1.0/materias/departamento/:departamento Alta de materia
     * @apiDescription Realiza un alta de una materia asociada a un departamento
     * @apiName create
     * @apiGroup Materias
     *
     * @apiParam {ObjectId} departamento       Identificador del departamento
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {String}        subcodigo       Subcódigo de la materia (identificador dentro del depto)
     * @apiParam (Body) {String}        nombre          Nombre de la materia
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "materia": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "codigo": "7547",
     *             "subcodigo": "47",
     *             "nombre": "Taller de Desarrollo de Proyectos II"
     *         }
     *       }
     *     }
     */
    router.post(BASE_URL + '/departamento/:departamento',
        routes.validateInput('departamento', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('subcodigo', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('nombre', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {get} /api/v1.0/materias/:materia Información de materia
     * @apiDescription Retorna la información de una materia
     * @apiName retrieveOne
     * @apiGroup Materias
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "materia": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "codigo": "7547",
     *             "subcodigo": "47",
     *             "nombre": "Taller de Desarrollo de Proyectos II"
     *         }
     *       }
     *     }
     */
    router.get(BASE_URL + '/:materia',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {put} /api/v1.0/materias/:materia Modificación de materia
     * @apiDescription Realiza la actualización de una materia
     * @apiName update
     * @apiGroup Materias
     *
     * @apiParam {ObjectId}         materia Identificador del curso
     * 
     * @apiHeader {String}          token   Token de acceso
     * 
     * @apiParam (Body) {String}    nombre  Nombre de la materia
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "materia": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "codigo": "7547",
     *             "subcodigo": "47",
     *             "nombre": "Taller de Desarrollo de Proyectos II"
     *         }
     *       }
     *     }
     */
    router.put(BASE_URL + '/:materia',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('nombre', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {delete} /api/v1.0/materias/:materia Remover materia
     * @apiDescription Remueve una materia
     * @apiName removeOne
     * @apiGroup Materias
     *
     * @apiParam {ObjectId}     materia Identificador de la materia
     * 
     * @apiHeader {String}      token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Materia dada de baja."
     *       }
     *     }
     */
    router.delete(BASE_URL + '/:materia',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Materia dada de baja.' });
        });
}

module.exports = MateriaRoutes;