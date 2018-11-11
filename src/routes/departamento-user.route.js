const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const DepartamentoUserService = require('../services/departamento-user.service');
const CursoService = require('../services/curso.service');
const logger = require('../utils/logger');

const BASE_URL = '/departamentos';

var DepartamentRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/departamentos/gestion Departamentos asignados a usuario
     * @apiDescription Retorna los departamentos asignados a un usuario, con las materias asociadas a cada departamento.
     * @apiName retrieve123
     * @apiGroup Departamentos
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "departamentos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "codigo": 75,
     *                  "nombre": "Departamento de Computación",
     *                  "materias": [
     *                      {
     *                          "_id": "a4dc2187abc8fe8a8dcb7100",
     *                          "codigo": "75.40",
     *                          "nombre": "Algoritmos y Programación I",
     *                          "creditos": 6
     *                      },
     *                      {
     *                          "_id": "a4dc2187abc8fe8a8dcb7101",
     *                          "codigo": "75.41",
     *                          "nombre": "Algoritmos y Programación II",
     *                          "creditos": 6
     *                      },
     *                      ...
     *                  ]
     *              },    
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/gestion',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        (req, res) => {
            let user_id = req.context.user._id;

            DepartamentoUserService.searchAssignedDepartaments(user_id, (error, result) => {
                if (error) {
                    logger.error('[departamentos][gestion] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { departamentos: result });
                }
            });
        });

    /**
     * @api {get} /api/v1.0/departamentos/:departamento/cursos 
     * @apiDescription Retorna los cursos para un departamento.
     * @apiName retrieve1234
     * @apiGroup Departamentos
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          ""
     *          "departamentos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "codigo": 75,
     *                  "nombre": "Departamento de Computación",
     *                  "materias": [
     *                      {
     *                          "_id": "a4dc2187abc8fe8a8dcb7100",
     *                          "codigo": "75.40",
     *                          "nombre": "Algoritmos y Programación I",
     *                          "creditos": 6
     *                      },
     *                      {
     *                          "_id": "a4dc2187abc8fe8a8dcb7101",
     *                          "codigo": "75.41",
     *                          "nombre": "Algoritmos y Programación II",
     *                          "creditos": 6
     *                      },
     *                      ...
     *                  ]
     *              },    
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/:departamento/cursos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('departamento', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('docenteACargo', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('jtp', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('anio', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('cuatrimestre', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('page', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('limit', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        (req, res) => {

            CursoService.searchCoursesByDepartament(req.params.departamento, req.query, (error, result) => {
                if (error) {
                    logger.error('[departamentos]['+req.params.departamento+'][cursos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });
}

module.exports = DepartamentRoutes;