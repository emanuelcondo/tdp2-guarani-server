const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/auth';

var AuthRoutes = function (router) {
    /**
     * @api {post} /auth/student/login Login Alumno
     * @apiDescription Autenticación para alumnos
     * @apiName Login Alumno
     * @apiGroup Autenticacion
     *
     * @apiParam (Body) {String} identifier     Identificador del alumno
     * @apiParam (Body) {String} password       Contraseña del alumno
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "access_token": <token_de_acceso>
     *     }
     */
    router.post(BASE_URL + '/student/login',
        routes.validateInput('identifier', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { access_token: '1234' });
        });

    /**
     * @api {post} /auth/teacher/login Login Docente
     * @apiDescription Autenticación para docentes
     * @apiName Login Docente
     * @apiGroup Autenticacion
     *
     * @apiParam (Body) {String} identifier     Identificador del docente
     * @apiParam (Body) {String} password       Contraseña del docente
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "access_token": <token_de_acceso>
     *     }
     */
    router.post(BASE_URL + '/teacher/login',
        routes.validateInput('identifier', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        routes.validateInput('password', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Body, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { access_token: '1234' });
        });
}

module.exports = AuthRoutes;