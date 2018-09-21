const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/alumnos';

var AlumnoRoutes = function (router) {
    /**
     * @api {post} /alumnos/login Login de Alumno
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
     *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
     *       }
     *     }
     */
    router.post(BASE_URL + '/login',
        routes.validateInput('usuario', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { token: '1234' });
        });

    /**
     * @api {post} /alumnos/logout Logout de Alumno
     * @apiDescription Cierre de sesión
     * @apiName Logut de Alumno
     * @apiGroup Alumnos
     *
     * @apiHeader {String} token    Identificador del alumno
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
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Sesión cerrada.' });
        });
}

module.exports = AlumnoRoutes;