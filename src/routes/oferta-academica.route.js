const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const MateriaService = require('../services/materia.service');
const CarreraService = require('../services/carrera.service');
const logger = require('../utils/logger');

const BASE_URL = '/oferta-academica';

var OfertaAcademicaRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/oferta-academica/materias/carrera/:carrera Oferta Académica
     * @apiDescription Retorna las materias asociadas a una carrera
     * @apiName retrieve12
     * @apiGroup OfertaAcademica
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
    router.get(BASE_URL + '/materias/carrera/:carrera',
        routes.validateInput('carrera', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        CarreraService.carrerRestricted(),
        (req, res) => {
            let user = req.context.user;
            let checkInscriptions = false;

            MateriaService.retrieveSubjectsByCarrer(user, req.params.carrera, checkInscriptions, (error, result) => {
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
}

module.exports = OfertaAcademicaRoutes;