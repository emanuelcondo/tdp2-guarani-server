const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

const BASE_URL = '/alumnos';

var AlumnoRoutes = function (router) {
    /**
     * @api {post} /api/v1.0/alumnos/login Login de Alumno
     * @apiDescription Autenticación para alumnos
     * @apiName Login de Alumno
     * @apiGroup Alumnos
     *
     * @apiParam (Body) {String} usuario    Identificador del alumno
     * @apiParam (Body) {String} password   Contraseña del alumno
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
     *          "expiracionToken": "2018-09-22T02:08:25.559Z",
     *          "nombre": "Juan",
     *          "apellido": "Perez",
     *          "legajo": 100000
     *       }
     *     }
     */
    router.post(BASE_URL + '/login',
        routes.validateInput('usuario', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        AuthService.authenticateUser(AuthService.ALUMNO),
        (req, res) => {
            let user = req.context.user;

            AuthService.generateSessionToken(user, AuthService.ALUMNO, (error, result) => {
                if (error) {
                    logger.error('[alumnos][login] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
                } else if (result) {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, result);
                }
            });
        });

    /**
     * @api {get} /api/v1.0/alumnos/mis-datos Información de Alumno
     * @apiDescription Retorna la información de un alumno
     * @apiName Información de Alumno
     * @apiGroup Alumnos
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
     *          "legajo": 100000,
     *          "carreras": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7120",
     *                  "codigo": "9",
     *                  "nombre": "LICENCIATURA EN ANÁLISIS DE SISTEMAS"
     *              }
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "codigo": "10",
     *                  "nombre": "INGENIERÍA EN INFORMÁTICA"
     *              }
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-datos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            let user = req.context.user;

            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { alumno: user });
        });

    /**
     * @api {post} /api/v1.0/alumnos/logout Logout de Alumno
     * @apiDescription Cierre de sesión
     * @apiName Logut de Alumno
     * @apiGroup Alumnos
     *
     * @apiHeader {String} token    Token de sesión
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "mensaje": "Sesión cerrada."
     *       }
     *     }
     */
    router.post(BASE_URL + '/logout',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.logout(),
        (req, res) => {
            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { mensaje: 'Sesión cerrada.' });
        });
}

module.exports = AlumnoRoutes;