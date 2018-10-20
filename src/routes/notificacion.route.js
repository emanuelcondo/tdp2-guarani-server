const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const FirebaseService = require('../services/firebase.service');
const logger = require('../utils/logger');

const BASE_URL = '/notificaciones/token';

var NotificationRoutes = function (router) {
    /**
     * @api {put} /api/v1.0/notificaciones/token Actualizar token (Firebase)
     * @apiDescription Actualiza el token de registración (Firebase) para recibir notificaciones en caso de algún evento que involucre al usuario.
     * @apiName retrieve
     * @apiGroup Notificaciones
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {String} registrationToken     Token generado por Firebase para recibir notificaciones.
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Token actualzado correctamente."
     *       }
     *     }
     */
    router.put(BASE_URL,
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        routes.validateInput('registrationToken', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        FirebaseService.checkRegistrationToken(),
        (req, res) => {
            let user = req.context.user;
            let registrationToken = req.body.registrationToken;

            FirebaseService.updateRegistrationToken(user._id, registrationToken, (error) => {
                if (error) {
                    logger.error('[notificaciones][registrar-token] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.SUCCESS, { message: 'Token registrado exitosamente.' });
                }
            });
        });
}

module.exports = NotificationRoutes;