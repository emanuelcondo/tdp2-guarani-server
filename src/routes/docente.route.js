const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

const BASE_URL = '/docentes';

var AlumnoRoutes = function (router) {
    /**
     * @api {post} /api/v1.0/docentes/login Login de Docente
     * @apiDescription Autenticación para docentes
     * @apiName Login de Docente
     * @apiGroup Docentes
     *
     * @apiParam (Body) {String} usuario    Identificador del docente
     * @apiParam (Body) {String} password   Contraseña del docente
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
     *          "rol": "docente",
     *          "expiracionToken": "2018-09-22T02:08:25.559Z",
     *          "nombre": "Juan",
     *          "apellido": "Perez",
     *       }
     *     }
     */
    router.post(BASE_URL + '/login',
        routes.validateInput('usuario', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.authenticateUser(AuthService.DOCENTE),
        (req, res) => {
            let user = req.context.user;

            AuthService.generateSessionToken(user, AuthService.DOCENTE, (error, result) => {
                if (error) {
                    logger.error(error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });

    /**
     * @api {get} /api/v1.0/docentes/mis-datos Información de Docente
     * @apiDescription Retorna la información de un docente
     * @apiName Información de Docente
     * @apiGroup Docentes
     *
     * @apiHeader {String} token   Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "nombre": "Juan",
     *          "apellido": "Perez",
     *          "dni": "1111111"
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-datos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        (req, res) => {
            let user = req.context.user;

            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { docente: user });
        });


    /**
     * @api {post} /api/v1.0/docentes/logout Logout de Docente
     * @apiDescription Cierre de sesión
     * @apiName Logut de Docente
     * @apiGroup Docentes
     *
     * @apiHeader {String} token    Identificador del docente
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Sesión cerrada."
     *       }
     *     }
     */
    router.post(BASE_URL + '/logout',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Sesión cerrada.' });
        });
}

module.exports = AlumnoRoutes;