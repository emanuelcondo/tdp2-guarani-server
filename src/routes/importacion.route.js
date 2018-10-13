const routes = require('./routes');
const Constants = require('../utils/constants');

const BASE_URL = '/importacion';

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
     * Departamento,Identificador Materia dentro del Departamento,Nombre
     * 61,03,Departamento de Matemática
     * 62,01,Departamento de Física
     * 63,01,Departamento de Química
     * 75,40,Algoritmos y Programación I
     * 75,46,Administración y Control de Proyectos Informáticos II
     * 
     * @apiSuccessExample {text} Aulas
     * POST /api/v1.0/importacion/aulas
     * 
     * Sede,Aula
     * PC,101
     * PC,L6
     * LH,201
     * CU,301
     * 
     * @apiSuccessExample {json} Respuesta
     * HTTP/1.1 200 OK
     * {
     *   "status": "success",
     *   "data": {
     *      "cantidadRegistrosImportados": 27001
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
        routes.validateInput('materia', Constants.VALIDATION_TYPES.ObjectId, Constants.VALIDATION_SOURCES.Params, Constants.VALIDATION_MANDATORY),
        (req, res) => {
            routes.doRespond(req, res, 200, { examenes: [] });
        });
}

module.exports = ImportacionRoutes;