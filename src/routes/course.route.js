const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/courses';

var CourseRoutes = function (router) {
    /**
     * @api {get} /courses?subject=<subject_id>&page=<page>&limit=<limit> Lista de cursos
     * @apiDescription Retorna los cursos asociados a una materia
     * @apiName retrieve
     * @apiGroup Cursos
     *
     * @apiParam (Query string) {String} subject     Identificador de la materia (ObjectId)
     * @apiParam (Query string) {int} [page]     Número de página
     * @apiParam (Query string) {int} [limit]     Cantidad de materias por página
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "courses": [
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
        routes.validateInput('subject', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { courses: [] });
        });


    /**
     * @api {post} /courses/new?subject=<subject_id> Alta de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName create
     * @apiGroup Cursos
     *
     * @apiParam (Query string) {String} subject     Identificador de la materia (ObjectId)
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiParam (Body) {String} code     Código
     * @apiParam (Body) {String} teacher     Identificador del docente a cargo (ObjectId)
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "course": {
     *              
     *          }
     *       }
     *     }
     */
    router.post(BASE_URL + '/new',
        (req, res) => {
            routes.doRespond(req, res, 200, { course: {} });
        });


    /**
     * @api {get} /courses/:_id Información de curso
     * @apiDescription Retorna la información de un curso
     * @apiName retrieveOne
     * @apiGroup Cursos
     *
     * @apiParam {String} _id     Identificador del curso (ObjectId)
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "course": {
     *              
     *          }
     *       }
     *     }
     */
    router.get(BASE_URL + '/:_id',
        (req, res) => {
            routes.doRespond(req, res, 200, { course: {} });
        });


    /**
     * @api {put} /courses/:_id Modificación de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName update
     * @apiGroup Cursos
     *
     * @apiParam (Query string) {String} _id     Identificador del curso (ObjectId)
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiParam (Body) {String} code     Código
     * @apiParam (Body) {String} teacher     Identificador del docente a cargo (ObjectId)
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "course": {
     *              
     *          }
     *       }
     *     }
     */
    router.put(BASE_URL + '/:_id',
        (req, res) => {
            routes.doRespond(req, res, 200, { course: {} });
        });


    /**
     * @api {delete} /courses/:_id Remover curso
     * @apiDescription Remueve un curso
     * @apiName removeOne
     * @apiGroup Cursos
     *
     * @apiParam {String} _id     Identificador del curso (ObjectId)
     * 
     * @apiHeader {String} token     Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "course": {
     *              
     *          }
     *       }
     *     }
     */
    router.delete(BASE_URL + '/:_id',
        (req, res) => {
            routes.doRespond(req, res, 200, { course: {} });
        });
}

module.exports = CourseRoutes;