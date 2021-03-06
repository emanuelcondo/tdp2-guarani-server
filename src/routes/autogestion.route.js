const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const PeriodoService = require('../services/periodo.service');
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
     * @api {get} /api/v1.0/autogestion/vericar-token Verificar Sesión de Docente/Departamento/Admins
     * @apiDescription Verifica que el token de sesión no haya expirado.
     * @apiName Verificar token Docente/Departamento/Admnistrador
     * @apiGroup Autogestion
     *
     * @apiHeader {String} token   Token de sesión
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
    router.get(BASE_URL + '/verificar-token',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        (req, res) => {
            let user = req.context.user;

            let data = {
                token: req.headers.token,
                rol: user.role,
                expiracionToken: (new Date(req.context.decoded.exp * 1000)).toISOString()
            };            
            routes.doRespond(req, res, Constants.HTTP.SUCCESS, data);
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
     *          },
     *          "periodo": {
     *              "_id": "a2bc2187abc8fe8a8dcb7121",
     *              "cuatrimestre": 2,
     *              "anio": 2018,
     *              "inscripcionCurso": {
     *                  "inicio": "2018-08-03T03:00:00.000Z",
     *                  "fin": "2018-08-08T03:00:00.000Z"
     *              },
     *              "desinscripcionCurso": {
     *                  "inicio": "2018-08-10T03:00:00.000Z",
     *                  "fin": "2018-08-15T03:00:00.000Z"
     *              },
     *              "cursada": {
     *                  "inicio": "2018-08-17T03:00:00.000Z",
     *                  "fin": "2018-12-03T03:00:00.000Z"
     *              },
     *              "consultaPrioridad": {
     *                  "inicio": "2018-07-27T03:00:00.000Z",
     *                  "fin": "2018-12-03T03:00:00.000Z"
     *              }
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/mis-datos',
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.DOCENTE),
        PeriodoService.loadCurrentPeriod(),
        (req, res) => {
            let user = req.context.user;
            let periodo = req.context.period;

            routes.doRespond(req, res, Constants.HTTP.SUCCESS, { usuario: user, periodo: periodo });
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