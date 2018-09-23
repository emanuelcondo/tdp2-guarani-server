const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const CursoService = require('../services/curso.service');
const logger = require('../utils/logger');

const BASE_URL = '/materias/:materia/cursos';

var CursoRoutes = function (router) {
    /**
     * @api {get} /api/v1.0/materias/:materia/cursos Lista de cursos
     * @apiDescription Retorna los cursos asociados a una materia
     * @apiName retrieve
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "cursos": [
     *              {
     *                  "_id": "a2bc2187abc8fe8a8dcb7121",
     *                  "comision": 1,
     *                  "materia": {
     *                      "codigo": "7547",
     *                      "nombre": "Taller de Desarrollo de Proyectos II"
     *                  },
     *                  "sede": {
     *                      "codigo": "PC",
     *                      "nombre": "Paseo Colón"
     *                  },
     *                  "docenteACargo": {
     *                      "nombre": "Moises Carlos",
     *                      "apellido": "Fontela"
     *                  },
     *                  "jtp": {
     *                      "nombre": "Alejandro Gustavo",
     *                      "apellido": "Molinari"
     *                  },
     *                  "ayudantes": [
     *                      {
     *                          "nombre": "Marcio",
     *                          "apellido": "Degiovannini"
     *                      },
     *                      ...
     *                  ],
     *                  "cursada": [
     *                      {
     *                          "aula": "302",
     *                          "tipo": "Práctica",
     *                          "dia": "Lunes",
     *                          "horario_desde": "17:00",
     *                          "horario_hasta": "19:00",
     *                      },
     *                      {
     *                          "aula": "319",
     *                          "tipo": "Práctica",
     *                          "dia": "Lunes",
     *                          "horario_desde": "19:00",
     *                          "horario_hasta": "23:00",
     *                      }
     *                  ]
     *              },
     *              ...
     *          ]
     *       }
     *     }
     */
    router.get(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ALUMNO),
        (req, res) => {
            CursoService.retrieveCoursesBySubject(req.params.materia, (error, result) => {
                if (error) {
                    logger.error('[materias][:materia][cursos] '+error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { mensaje: 'Un error inesperado ha ocurrido.' });
                } else {
                    routes.doRespond(req, res, Constants.HTTP.SUCCESS, { cursos: result });
                }
            });
        });


    /**
     * @api {post} /api/v1.0/materias/:materia/cursos Alta de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName create
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiParam (Body) {Integer}       comision        Comisión del curso de la materia
     * @apiParam (Body) {ObjectId}      sede            Identificador de la sede
     * @apiParam (Body) {ObjectId}      [docenteACargo] Identificador del docente a cargo
     * @apiParam (Body) {ObjectId}      [jtp]           Identificador del jtp
     * @apiParam (Body) {ObjectId[]}    [ayudantes]     Identificadores de los ayudantes
     * @apiParam (Body) {Object[]}      [cursada]       Información sobre la cursada 
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "sede": {
     *                "codigo": "PC",
     *                "nombre": "Paseo Colón"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [
     *                 {
     *                     "nombre": "Marcio",
     *                     "apellido": "Degiovannini"
     *                 },
     *                 ...
     *             ],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.post(BASE_URL,
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {get} /api/v1.0/materias/:materia/cursos/:curso Información de curso
     * @apiDescription Retorna la información de un curso
     * @apiName retrieveOne
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia     Identificador de la materia
     * @apiParam {ObjectId} curso       Identificador del curso
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "sede": {
     *                "codigo": "PC",
     *                "nombre": "Paseo Colón"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [
     *                 {
     *                     "nombre": "Marcio",
     *                     "apellido": "Degiovannini"
     *                 },
     *                 ...
     *             ],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.get(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {put} /api/v1.0/materias/:materia/cursos/:curso Modificación de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName update
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId}     materia Identificador de la materia
     * @apiParam {ObjectId}     curso   Identificador del curso
     * 
     * @apiHeader {String}      token   Token de acceso
     * 
     * @apiParam (Body) {ObjectId}      sede            Identificador de la sede
     * @apiParam (Body) {ObjectId}      [docenteACargo] Identificador del docente a cargo
     * @apiParam (Body) {ObjectId}      [jtp]           Identificador del jtp
     * @apiParam (Body) {ObjectId[]}    [ayudantes]     Identificadores de los ayudantes
     * @apiParam (Body) {Object[]}      [cursada]       Información sobre la cursada 
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *         "curso": {
     *             "_id": "a2bc2187abc8fe8a8dcb7121",
     *             "comision": 1,
     *             "materia": {
     *                 "codigo": "7547",
     *                 "nombre": "Taller de Desarrollo de Proyectos II"
     *             },
     *             "sede": {
     *                "codigo": "PC",
     *                "nombre": "Paseo Colón"
     *             },
     *             "docenteACargo": {
     *                "nombre": "Moises Carlos",
     *                "apellido": "Fontela"
     *             },
     *             "jtp": {
     *                "nombre": "Alejandro Gustavo",
     *                "apellido": "Molinari"
     *             },
     *             "ayudantes": [
     *                 {
     *                     "nombre": "Marcio",
     *                     "apellido": "Degiovannini"
     *                 },
     *                 ...
     *             ],
     *             "cursada": [
     *                 {
     *                    "aula": "302",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "17:00",
     *                    "horario_hasta": "19:00",
     *                 },
     *                 {
     *                    "aula": "319",
     *                    "tipo": "Práctica",
     *                    "dia": "Lunes",
     *                    "horario_desde": "19:00",
     *                    "horario_hasta": "23:00",
     *                 }
     *             ]
     *         }
     *       }
     *     }
     */
    router.put(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {delete} /api/v1.0/materias/:materia/cursos/:curso Remover curso
     * @apiDescription Remueve un curso
     * @apiName removeOne
     * @apiGroup Cursos
     *
     * @apiParam {String}   materia Identificador de la materia (ObjectId)
     * @apiParam {String}   curso   Identificador del curso (ObjectId)
     * 
     * @apiHeader {String}  token   Token de acceso
     * 
     * @apiSuccessExample {json} Respuesta exitosa:
     *     HTTP/1.1 200 OK
     *     {
     *       "status": "success",
     *       "data": {
     *          "message": "Curso dado de baja."
     *       }
     *     }
     */
    router.delete(BASE_URL + '/:curso',
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('curso', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Curso dado de baja.' });
        });
}

module.exports = CursoRoutes;