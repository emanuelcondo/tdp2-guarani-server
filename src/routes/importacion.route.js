const routes = require('./routes');
const Constants = require('../utils/constants');
const AuthService = require('../services/auth.service');
const CarreraService = require('../services/carrera.service');
const CSVImporter = require('../services/csv-importer.service');
const Upload = require('../utils/upload');
const logger = require('../utils/logger');
const fs = require('fs');

const BASE_URL = '/importacion';
const allowed_values = ['alumnos', 'docentes', 'carreras', 'departamentos', 'materias', 'aulas'];

var ImportacionRoutes = function (router) {
    /**
     * @api {post} /api/v1.0/importacion/:tipo Importación para carga de datos
     * @apiDescription Importación de datos mediante un archivo csv
     * @apiName retrieve
     * @apiGroup Importacion
     *
     * @apiParam {String}   tipo     Tipo de importación a realizar. Valores posibles: alumnos, docentes, carreras, departamentos, materias y aulas.
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {text} Alumnos
     * POST /api/v1.0/importacion/alumnos
     * 
     * Padrón,DNI,Nombres,Apellidos,Carreras,Prioridad
     * 100000,40123456,Juan,Peréz,[9,10],5
     * 100001,40225459,Juan Manuel,Gonzalez,[10],2
     * 100002,40324458,Martin,Cura Coronel,[9],1
     * 100003,40423457,Cristian,Bert,[5],50
     * ...
     * 
     * @apiSuccessExample {text} Docentes
     * POST /api/v1.0/importacion/docentes
     * 
     * DNI,Nombres,Apellidos
     * 18222098,Jorge Luis,Cornejo
     * 22000123,Mariano,Mendez
     * 15987123,Fernando,Acero
     * 19647210,Gabriela,Vargas
     * 
     * @apiSuccessExample {text} Carreras
     * POST /api/v1.0/importacion/carreras
     * 
     * Identificador,Nombre
     * 1,Ingeniería Civil
     * 2,Ingeniería Industrial
     * 3,Ingeniería Naval y Mecánica
     * 4,Agrimensura
     * 5,Ingeniería Mecánica
     * 6,Ingeniería Electricista
     * 7,Ingeniería Electrónica
     * 8,Ingeniería Química
     * 9,Licenciatura en Análisis de Sistemas
     * 10,Ingeniería en Informática
     * 11,Ingeniería en Alimentos
     * 12,Ingeniería en Agrimensura
     * 
     * @apiSuccessExample {text} Departamentos
     * POST /api/v1.0/importacion/departamentos
     * 
     * Identificador,Nombre
     * 61,Departamento de Matemática
     * 62,Departamento de Física
     * 63,Departamento de Química
     * 75,Departamento de Computación
     * 
     * @apiSuccessExample {text} Materias
     * POST /api/v1.0/importacion/materias
     * 
     * Departamento,Identificador,Nombre,Créditos
     * 61,03,Análisis Matemático II A,8
     * 62,01,Física I A,8
     * 63,01,Química,6
     * 75,40,Algoritmos y Programación I,6
     * 75,46,Administración y Control de Proyectos Informáticos II,6
     * 
     * @apiSuccessExample {text} Aulas
     * POST /api/v1.0/importacion/aulas
     * 
     * Sede,Aula,Capacidad
     * PC,101,30
     * PC,L6,25
     * LH,201,70
     * CU,301,50
     * 
     * @apiSuccessExample {json} Respuesta
     * HTTP/1.1 200 OK
     * {
     *   "status": "success",
     *   "data": {
     *      "cantidadRegistrosProcesados": 27001
     *   }
     * }
     * 
     * HTTP/1.1 422 UNPROCESSABLE ENTITY
     * {
     *   "status": "error",
     *   "data": {
     *      "message": "Fila 27: Padrón contiene un valor inválido."
     *   }
     * }
     */
    router.post(BASE_URL + '/:tipo',
        routes.validateInput('tipo', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY, { allowed_values: allowed_values }),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        Upload.checkFile(),
        (req, res) => {
            CSVImporter.import(req.file.path, req.params.tipo, (error, result) => {
                fs.unlink(req.file.path, (error) => {
                    if (error) {
                        logger.warn('[importacion]['+req.params.tipo+'][fs-unlink] ' + error);
                    }
                });

                if (error) {
                    logger.error('[importacion]['+req.params.tipo+'][post-processing] ' + error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    let statusCode = (result.status == 'success') ? Constants.HTTP.SUCCESS : Constants.HTTP.UNPROCESSABLE_ENTITY;
                    routes.doRespond(req, res, statusCode, result);
                }
            });
        });


    /**
     * @api {post} /api/v1.0/importacion/:codigo/plan-de-estudios Importación de plan de estudios
     * @apiDescription Importación de materias asociadas a una carrera mediante un archivo csv
     * @apiName retrieve1
     * @apiGroup Importacion
     *
     * @apiParam {Integer}   codigo     Código de carrera
     * 
     * @apiHeader {String}  token       Token de acceso
     * 
     * @apiSuccessExample {text} Plan de estudios
     * POST /api/v1.0/importacion/10/plan-de-estudios
     * 
     * Código,Materia
     * 61.03,Análisis Matemático II A
     * 62.01,Física I A
     * 63.01,Química
     * 75.40,Algoritmos y Programación I
     * 75.46,Administración y Control de Proyectos Informáticos II
     * ...
     * 
     * @apiSuccessExample {json} Respuesta
     * HTTP/1.1 200 OK
     * {
     *   "status": "success",
     *   "data": {
     *      "cantidadRegistrosProcesados": 27
     *   }
     * }
     * 
     * HTTP/1.1 422 UNPROCESSABLE ENTITY
     * {
     *   "status": "error",
     *   "data": {
     *      "message": "Fila 27: Código contiene un valor inválido."
     *   }
     * }
     */
    router.post(BASE_URL + '/:codigo/plan-de-estudios',
        routes.validateInput('codigo', Constants.VALIDATION_TYPES.Int, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        routes.validateInput('token', Constants.VALIDATION_TYPES.String, Constants.VALIDATION_SOURCES.Headers, Constants.VALIDATION_MANDATORY),
        AuthService.tokenRestricted(),
        AuthService.roleRestricted(AuthService.ADMIN),
        CarreraService.loadInfo(),
        Upload.checkFile(),
        (req, res) => {
            CSVImporter.importProgramForCarrer(req.file.path, req.params.codigo, (error, result) => {
                fs.unlink(req.file.path, (error) => {
                    if (error) {
                        logger.warn('[importacion][plan-de-estudios]['+req.params.codigo+'][fs-unlink] ' + error);
                    }
                });

                if (error) {
                    logger.error('[importacion][plan-de-estudios]['+req.params.codigo+'][post-processing] ' + error);
                    routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    let statusCode = (result.status == 'success') ? Constants.HTTP.SUCCESS : Constants.HTTP.UNPROCESSABLE_ENTITY;
                    routes.doRespond(req, res, statusCode, result);
                }
            });
        });
}

module.exports = ImportacionRoutes;