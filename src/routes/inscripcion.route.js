const routes = require('./routes');

const BASE_URL = '/inscripciones';

var SubjectRoutes = function (router) {
    /**
     * @api {get} /subjects?carrer=<carrer_id> Login Alumno
     * @apiDescription Autenticación para alumnos
     * @apiName Lista de materias
     * @apiGroup Materias
     *
     * @apiParam {String} carrer_id     Identificador de la carrera
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "subjects": [
     *              {
     *                  "_id":
     *              },
     *              ...
     *          ],
     *          "page": 1,
     *          "limit": 20,
     *          "pageCount": 3
     *       }
     *     }
     */
    router.get(BASE_URL,
        (req, res) => {
            routes.doRespond(req, res, 200, { subjects: [] });
        });

    /**
     * @api {get} /auth/teacher/login Login Docente
     * @apiDescription Autenticación para docentes
     * @apiName Login Docente
     * @apiGroup Materias
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
    router.get(BASE_URL + '/teacher/login',
        (req, res) => {
            routes.doRespond(req, res, 200, { access_token: '1234' });
        });
}

module.exports = SubjectRoutes;