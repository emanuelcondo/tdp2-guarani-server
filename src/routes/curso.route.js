const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/cursos';

var CursoRoutes = function (router) {
    /**
     * @api {get} /cursos?materia=:materia_id Lista de cursos
     * @apiDescription Retorna los cursos asociados a una materia
     * @apiName retrieve
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia_id  Identificador de la materia
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
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { cursos: [] });
        });


    /**
     * @api {post} /cursos?materia=:materia_id Alta de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName create
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} materia_id  Identificador de la materia
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
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Query, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {get} /cursos/:_id Información de curso
     * @apiDescription Retorna la información de un curso
     * @apiName retrieveOne
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId} _id     Identificador del curso
     * 
     * @apiHeader {String}  token   Token de acceso
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
    router.get(BASE_URL + '/:_id',
        routes.validateInput('_id', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {put} /cursos/:_id Modificación de curso
     * @apiDescription Realiza un alta de curso asociado a una materia
     * @apiName update
     * @apiGroup Cursos
     *
     * @apiParam {ObjectId}     _id     Identificador del curso
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
    router.put(BASE_URL + '/:_id',
        routes.validateInput('_id', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { curso: {} });
        });


    /**
     * @api {delete} /cursos/:_id Remover curso
     * @apiDescription Remueve un curso
     * @apiName removeOne
     * @apiGroup Cursos
     *
     * @apiParam {String}   _id     Identificador del curso (ObjectId)
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
    router.delete(BASE_URL + '/:_id',
        routes.validateInput('_id', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { message: 'Curso dado de baja.' });
        });
}

module.exports = CursoRoutes;