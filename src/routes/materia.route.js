const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/materias';

var MateriaRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/carrera/:carrera Lista de materias
     * @apiDescription Retorna las materias asociadas a una carrera
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
        (req, res) => {
            routes.doRespond(req, res, 200, { materias: [] });
        });


    /**
     * @api {post} /api/v1.0/materias/departamento/:departamento Alta de materia
     * @apiDescription Realiza un alta de una materia asociada a un departamento
     * @apiName create
     * @apiGroup Cursos
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
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Materia dada de baja.' });
        });
}

module.exports = MateriaRoutes;