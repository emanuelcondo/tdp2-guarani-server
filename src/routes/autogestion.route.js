const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

const BASE_URL = '/autogestion';

var AutogestionRoutes = function (router) {
    /**
     * @api {post} /api/v1.0/autogestion/login Login de Docente/Departamento/Admins
     * @apiDescription Autenticación para docentes, usuarios del departamento y/o administradores
     * @apiName Login de Docente/Departamento/Admnistrador
     * @apiGroup Autogestion
     *
     * @apiParam (Body) {String} usuario    Identificador del docente/departamento/administrador
     * @apiParam (Body) {String} password   Contraseña del docente/departamento/administrador
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
     *          "rol": "docente",
     *          "expiracionToken": "2018-09-22T02:08:25.559Z"
     *       }
     *     }
     */
    router.post(BASE_URL + '/login',
        routes.validateInput('usuario', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.authenticateUser(AuthService.AUTOGESTION),
        (req, res) => {
            let user = req.context.user;
            let role = user.role;

            AuthService.generateSessionToken(user, role, (error, result) => {
                if (error) {
                    logger.error('[autogestion][login] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });

    /**
     * @api {get} /api/v1.0/autogestion/mis-datos Información de Docente/Departamento/Admin
     * @apiDescription Retorna la información de un docente/departamento/administrador
     * @apiName Información de Docente/Departamento/Admin
     * @apiGroup Autogestion
     *
     * @apiHeader {String} token   Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "usuario": {
     *              "_id": "5ba5df611cc1ac5580f07714",
     *              "nombre": "Jorge",
     *              "apellido": "Cornejo",
     *              "dni": "1111111"
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-datos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        (req, res) => {
            let user = req.context.user;

            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { usuario: user });
        });


    /**
     * @api {post} /api/v1.0/autogestion/logout Logout de Docente/Departamento/Admin
     * @apiDescription Cierre de sesión
     * @apiName Logut de Docente/Departamento/Admin
     * @apiGroup Autogestion
     *
     * @apiHeader {String} token    Identificador del docente/departamento/administrador
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
        AuthService.logout(),
        (req, res) => {
            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { message: 'Sesión cerrada.' });
        });
}

module.exports = AutogestionRoutes;