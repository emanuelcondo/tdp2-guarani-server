const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const PeriodoService = require('../services/periodo.service');
const logger = require('../utils/logger');

const BASE_URL = '/periodos';

var PeriodoRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/periodos?page=1&limit=20 Períodos
     * @apiDescription Retorna los períodos (actual y anteriores) en orden descendente
     * @apiName retrieve
     * @apiGroup Periodo
     *
     * @apiParam {Integer} [page]       Página a la que se desea acceder (default = 1)
     * @apiParam {Integer} [limit]      Cantidad de períodos por página (default = 20)
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "totalcount": 30,
     *          "totalpages": 2,
     *          "page": 1,
     *          "periodos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "cuatrimestre": 2,
     *                  "anio": 2018,
     *                  "inscripcionCurso": {
     *                      "inicio": "2018-08-03T03:00:00.000Z",
     *                      "fin": "2018-08-08T03:00:00.000Z"
     *                  },
     *                  "desinscripcionCurso": {
     *                      "inicio": "2018-08-10T03:00:00.000Z",
     *                      "fin": "2018-08-15T03:00:00.000Z"
     *                  },
     *                  "cursada": {
     *                      "inicio": "2018-08-17T03:00:00.000Z",
     *                      "fin": "2018-12-03T03:00:00.000Z"
     *                  }
     *              },
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7120",
     *                  "cuatrimestre": 1,
     *                  "anio": 2018,
     *                  "inscripcionCurso": {
     *                      "inicio": "2018-03-03T03:00:00.000Z",
     *                      "fin": "2018-03-08T03:00:00.000Z"
     *                  },
     *                  "desinscripcionCurso": {
     *                      "inicio": "2018-03-10T03:00:00.000Z",
     *                      "fin": "2018-03-15T03:00:00.000Z"
     *                  },
     *                  "cursada": {
     *                      "inicio": "2018-03-17T03:00:00.000Z",
     *                      "fin": "2018-07-03T03:00:00.000Z"
     *                  }
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('page', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('limit', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_OPTIONAL),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            let params = {
                page: req.query.page,
                limit: req.query.limit
            }

            PeriodoService.searchPeriods(params, (error, result) => {
                if (error) {
                    logger.error('[periodo][search] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });
}

module.exports = PeriodoRoutes;