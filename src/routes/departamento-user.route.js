const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const DepartamentoUserService = require('../services/departamento-user.service');
const logger = require('../utils/logger');

const BASE_URL = '/departamentos';

var DepartamentRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/departamentos/gestion 
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
}

module.exports = DepartamentRoutes;