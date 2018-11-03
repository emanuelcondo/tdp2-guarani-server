const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const AulaService = require('../services/aula.service');
const logger = require('../utils/logger');

const BASE_URL = '/aulas';

const SEDE_ENUM = [ 'CU', 'LH', 'PC' ];

var AulaRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/aulas?sede=PC Aulas
     * @apiDescription Retorna todas las aulas (se puede aplicar un filtro por sede, opcional)
     * @apiName retrieve
     * @apiGroup Aulas
     *
     * @apiParam {String} [sede]       Filtro por sede
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "aulas": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "aula": "101",
     *                  "sede": "PC"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7122",
     *                  "aula": "102",
     *                  "sede": "PC"
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7123",
     *                  "aula": "103",
     *                  "sede": "PC"
     *              },        
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('sede', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL, { allowed_values: SEDE_ENUM }),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DEPARTAMENTO),
        (req, res) => {
            let params = {
                sede: req.query.sede
            }

            AulaService.searchClassrooms(params, (error, result) => {
                if (error) {
                    logger.error('[aulas][search] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { aulas: result });
                }
            });
        });
}

module.exports = AulaRoutes;