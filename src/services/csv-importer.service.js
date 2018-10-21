const fs = require('fs');
const csv = require('fast-csv');
const logger = require('../utils/logger');
const async = require('async');
const Utils = require('../utils/utils');
const CarreraModule = require('../models/carrera');
const Carrera = CarreraModule;
const AlumnoService = require('./alumno.service');
const DocenteService = require('./docente.service');
const CarreraService = require('./carrera.service');
const DepartamentoService = require('./departamento.service');
const MateriaService = require('./materia.service');
const AulaService = require('./aula.service');
const Alumno = require('../models/alumno').Alumno;
const Docente = require('../models/docente').Docente;
const Departamento = require('../models/departamento').Departamento;
const Materia = require('../models/materia').Materia;

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\ ]+$/;
const SUBJECT_CODE_REGEX = /^[[0-9]{2}\.[0-9]{2}]*$/;

const IMPORT_HEADERS = {
    alumnos: ['Padrón', 'DNI', 'Nombres', 'Apellidos', 'Carreras', 'Prioridad'],
    docentes: ['DNI', 'Nombres', 'Apellidos'],
    carreras: ['Identificador', 'Nombre'],
    departamentos: ['Identificador', 'Nombre'],
    materias: ['Departamento','Identificador','Nombre', 'Créditos'],
    aulas: ['Sede','Aula', 'Capacidad'],
    program: ['Materia', 'Nombre']
}

const IMPORT_TYPES = {
    ALUMNO: 'alumnos',
    DOCENTE: 'docentes',
    CARRERA: 'carreras',
    DEPARTAMENTO: 'departamentos',
    MATERIA: 'materias',
    AULA: 'aulas',
    PROGRAM: 'program'
};

module.exports.import = (filepath, type, callback) => {
    switch (type) {
        case IMPORT_TYPES.ALUMNO:
            _processStudents(filepath, callback);
            break;
        case IMPORT_TYPES.DOCENTE:
            _processProfessors(filepath, callback);
            break;
        case IMPORT_TYPES.CARRERA:
            _processCarrers(filepath, callback);
            break;
        case IMPORT_TYPES.DEPARTAMENTO:
            _processDepartaments(filepath, callback);
            break;
        case IMPORT_TYPES.MATERIA:
            _processSubjects(filepath, callback);
            break;
        case IMPORT_TYPES.AULA:
            _processClassrooms(filepath, callback);
            break;
        default:
            callback(null, { message: 'Tipo de importación inválido. Verifique el tipo de importación que desea realizar.' });
    }
}

module.exports.importProgramForCarrer = (filepath, carrerCode, callback) => {
    _processProgramForCarrer(filepath, carrerCode, callback);
}

//===========================================================================================//
/* GENERAL PARSER */
function _parse(filepath, type, callback) {
    let options = {
        delimiter: ',',
        headers: IMPORT_HEADERS[type]
    };

    let rows = [];
    let parseError = false;

    const parser = csv.fromPath(filepath, options)
        .on("error", (error) => {
            if (parseError) return;
            parseError = true;
            logger.debug('[csv-import][parse] '+error);
            parser.end();
            return callback({ status: 'error', message: 'Error al parsear el archivo. Verifique que los datos ingresados sean correctos.' });
        })
        .on("data", (data) => {
            if (parseError) return;
            rows.push(data);
        })
        .on("end", () => {
            if (parseError) return;
            rows.splice(0, 1); // removes headers
            callback(null, rows);
        });
}

/* ALUMNOS */
function _processStudents (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.ALUMNO, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][alumno][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateStudentRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message };
                        logger.debug('[validate][alumno][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][alumno][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][alumnos][import] Iniciando importación a la base...');
            AlumnoService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][alumnos][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de alumnos.' });
                } else {
                    logger.debug('[importacion][alumnos][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* ALUMNOS - VALIDATOR */
function _validateStudentRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isInt(row['Padrón']) && parseInt(row['Padrón']) > 0);
            let error = valid ? null : { message: 'Campo \'Padrón\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isInt(row['DNI']) && parseInt(row['DNI']) > 0);
            let error = valid ? null : { message: 'Campo \'DNI\' tiene un valor inválido.' };
            row['Password'] = row['DNI'];
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombres']) && NAME_REGEX.test(row['Nombres']));
            let error = valid ? null : { message: 'Campo \'Nombres\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Apellidos']) && NAME_REGEX.test(row['Apellidos']));
            let error = valid ? null : { message: 'Campo \'Apellidos\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            try {
                let carrers = JSON.parse(row['Carreras']);
                if (Utils.isArray(carrers) && carrers.length) {

                    let valid = true
                    let error_msg = '';

                    for (let i = 0; i < carrers.length && valid; i++) {
                        let id = carrers[i];
                        let unique = (carrers.indexOf(id) == i);
                        valid = (Utils.isInt(id) && parseInt(id) > 0 && unique);
                        if (!valid) error_msg = 'Campo \'Carreras\' tiene un valor inválido. Valor encontrado: ' + id + '.';
                    }

                    if (!valid) {
                        wCallback({ message: error_msg });
                    } else {
                        let query = { codigo: { $in: carrers } }
                        Carrera.findCarrers(query, (error, result) => {
                            if (error) {
                                logger.error('[importacion][alumnos][validator] ' + error);
                                wCallback({ message: 'Un error inesperado ha ocurrido al buscar carreras.' });
                            } else {
                                let error_msg = '';
                                let carrer_ids = [];
                                for (let id of carrers) {
                                    let found = result.find((item) => { return item.codigo == id; });
                                    if (!found) error_msg = 'Campo \'Carreras\' tiene un valor inválido. Carrera con código \'' + id + '\' no encontrado.';
                                    else carrer_ids.push(found._id);
                                }
                                row['Carreras'] = carrer_ids;

                                let error = error_msg ? { message: error_msg } : null;
                                wCallback(error);
                            }
                        });
                    }
                } else {
                    let error = { message: 'Campo \'Carreras\' tiene un valor inválido. Debería contener los códigos de las carreras inscriptas.' };
                    wCallback(error);
                }
            } catch (e) {
                let error = { message: 'Campo \'Carreras\' tiene un valor inválido.' };
                wCallback(error);
            }
        },
        (wCallback) => {
            let valid = (Utils.isInt(row['Prioridad']) && parseInt(row['Prioridad']) > 0 && parseInt(row['Prioridad']) < 121);
            let error = valid ? null : { message: 'Campo \'Prioridad\' tiene un valor inválido.' };
            wCallback(error);
        }
        /*,
        (wCallback) => {
            Alumno.findOne({ dni: row['DNI'] }, (error, found) => {
                if (error) {
                    logger.error('[importacion][alumnos][validator][find-one] ' + error);
                }
                if (!found) row['Password'] = row['DNI'];
                wCallback();
            });
        }
        */
    ], callback);
}

/* DOCENTES */
function _processProfessors (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.DOCENTE, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][docente][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateProfessorRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][docente][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    } else {
                        logger.debug('[validate][docente][row] Fila: '+ (index+1) + ' Status: OK');
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][docente][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][docente][import] Iniciando importación a la base...');
            DocenteService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][docentes][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de docentes.' });
                } else {
                    logger.debug('[importacion][docente][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* DOCENTES - VALIDATOR */
function _validateProfessorRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isInt(row['DNI']) && parseInt(row['DNI']) > 0);
            let error = valid ? null : { message: 'Campo \'DNI\' tiene un valor inválido.' };
            row['Password'] = row['DNI'];
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombres']) && NAME_REGEX.test(row['Nombres']));
            let error = valid ? null : { message: 'Campo \'Nombres\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Apellidos']) && NAME_REGEX.test(row['Apellidos']));
            let error = valid ? null : { message: 'Campo \'Apellidos\' tiene un valor inválido.' };
            wCallback(error);
        }
        /*,
        (wCallback) => {
            Docente.findOne({ dni: row['DNI'] }, (error, found) => {
                if (error) {
                    logger.error('[importacion][docentes][validator][find-one] ' + error);
                }
                if (!found) row['Password'] = row['DNI'];
                wCallback();
            });
        }
        */
    ], callback);
}

/* CARRERAS */
function _processCarrers (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.CARRERA, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][carrera][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateCarrerRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][carrera][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    } else {
                        logger.debug('[validate][carrera][row] Fila: '+ (index+1) + ' Status: OK');
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][carrera][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][carrera][import] Iniciando importación a la base...');
            CarreraService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][carreras][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de carreras.' });
                } else {
                    logger.debug('[importacion][carrera][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* CARRERA - VALIDATOR */
function _validateCarrerRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isInt(row['Identificador']) && parseInt(row['Identificador']) > 0);
            let error = valid ? null : { message: 'Campo \'Identificador\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombre']) && NAME_REGEX.test(row['Nombre']));
            let error = valid ? null : { message: 'Campo \'Nombre\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            CarreraModule.Carrera.findOne({ codigo: parseInt(row['Identificador']) }, (error, found) => {
                if (error) {
                    logger.error('[importacion][carreras][validator][find-one] ' + error);
                }
                if (!found) row['isNew'] = true;
                wCallback();
            });
        }
    ], callback);
}

/* DEPARTAMENTOS */
function _processDepartaments (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.DEPARTAMENTO, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][departamento][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateDepartamentRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][departamento][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    } else {
                        logger.debug('[validate][departamento][row] Fila: '+ (index+1) + ' Status: OK');
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][departamento][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][departamento][import] Iniciando importación a la base...');
            DepartamentoService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][departamentos][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de departamentos.' });
                } else {
                    logger.debug('[importacion][departamento][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* DEPARTAMENTO - VALIDATOR */
function _validateDepartamentRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isInt(row['Identificador']) && parseInt(row['Identificador']) > 0);
            let error = valid ? null : { message: 'Campo \'Identificador\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombre']) && NAME_REGEX.test(row['Nombre']));
            let error = valid ? null : { message: 'Campo \'Nombre\' tiene un valor inválido.' };
            wCallback(error);
        }
    ], callback);
}

/* MATERIAS */
function _processSubjects (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.MATERIA, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][materia][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateSubjectRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][materia][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][materia][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][materia][import] Iniciando importación a la base...');
            MateriaService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][materias][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de materias.' });
                } else {
                    logger.debug('[importacion][materia][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* MATERIA - VALIDATOR */
function _validateSubjectRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isInt(row['Departamento']) && parseInt(row['Identificador']) > 0);
            let error = valid ? null : { message: 'Campo \'Departamento\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isInt(row['Identificador']) && parseInt(row['Identificador']) > 0);
            let error = valid ? null : { message: 'Campo \'Identificador\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombre']) && NAME_REGEX.test(row['Nombre']));
            let error = valid ? null : { message: 'Campo \'Nombre\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isInt(row['Créditos']) && parseInt(row['Créditos']) > 0);
            let error = valid ? null : { message: 'Campo \'Créditos\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            Departamento.findOne({ codigo: parseInt(row['Departamento']) }, (error, found) => {
                if (error) {
                    logger.error('[importacion][materias][validator][find-one] ' + error);
                    wCallback({ message: 'Un error ocurrió al buscar el departamento asociado a una materia.' });
                } else if (!found) {
                    wCallback({ message: 'Departamento con código '+row['Departamento']+ ' no fue encontrado. Verifique que los datos ingresados sean correctos.' });
                } else {
                    row['Departamento_ID'] = found._id;
                    wCallback();
                }
            });
        }
    ], callback);
}


/* AULAS */
function _processClassrooms (filepath, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.AULA, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][aula][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateClassroomRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][aula][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][aula][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][aula][import] Iniciando importación a la base...');
            AulaService.import(rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][aulas][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar los registros de aulas.' });
                } else {
                    logger.debug('[importacion][aula][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* DEPARTAMENTO - VALIDATOR */
function _validateClassroomRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (['CU', 'LH', 'PC'].indexOf(row['Sede']) > -1);
            let error = valid ? null : { message: 'Campo \'Sede\' tiene un valor inválido. Valores permitidos: \'CU\', \'LH\',\'PC\'.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Aula']) && NAME_REGEX.test(row['Nombre']));
            let error = valid ? null : { message: 'Campo \'Aula\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isInt(row['Capacidad']) && parseInt(row['Capacidad']) > 0 );
            let error = valid ? null : { message: 'Campo \'Capacidad\' tiene un valor inválido.' };
            wCallback(error);
        }
    ], callback);
}

/* PLAN DE ESTUDIOS */
function _processProgramForCarrer (filepath, carrerCode, callback) {
    async.waterfall([
        (wCallback) => {
            _parse(filepath, IMPORT_TYPES.PROGRAM, wCallback);
        },
        (rows, wCallback) => {
            logger.debug('[validate][plan-de-estudios][rows] Iniciando validación de registros...');
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateCarrerSubjectRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { status: 'error', row: index + 1, message: error.message }
                        logger.debug('[validate][plan-de-estudios][materia][row] Fila: '+ (index+1) + ' Error: ' + error.message);
                    }
                    cb(result);
                });
            }, (asyncError) => {
                logger.debug('[validate][plan-de-estudios][rows] Validación de registros finalizada.');
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            logger.debug('[importacion][plan-de-estudios][import] Iniciando importación a la base...');
            CarreraService.importProgram(carrerCode, rows, (error, result) => {
                if (error) {
                    logger.error('[importacion][plan-de-estudios][import] ' + error);
                    wCallback(null, { status: 'error', message: 'Un error ocurrió al importar las materias para el plan de estudios de la carrera con código '+carrerCode+'.' });
                } else {
                    logger.debug('[importacion][plan-de-estudios][import] Importación a la base finalizada.');
                    wCallback(null, { status: 'success', cantidadRegistrosProcesados: rows.length });
                }
            });
        }
    ], (asyncError, result) => {
        if (asyncError) {
            if (asyncError.status = 'error') {
                callback(null, asyncError);
            } else {
                callback(asyncError);
            }
        } else {
            callback(null, result);
        }
    });
}

/* MATERIA - CARRERA - VALIDATOR */
function _validateCarrerSubjectRow (row, callback) {
    async.waterfall([
        (wCallback) => {
            let valid = (Utils.isString(row['Materia']) && SUBJECT_CODE_REGEX.test(row['Materia']));
            let error = valid ? null : { message: 'Campo \'Materia\' tiene un valor inválido. Verifique que tenga el siguiente formato: XX.XX, donde XX son valores numéricos positivos.' };
            if (error) {
                wCallback(error);
            } else {
                let query = { codigo: row['Materia'] };
                Materia.findOne(query, (error, found) => {
                    if (error) {
                        logger.error('[importacion][plan-de-estudios][materia][validator][find-one] ' + error);
                        wCallback({ message: 'Un error ocurrió al buscar la materia con código '+row['Materia']+'.' });
                    } else if (!found) {
                        wCallback({ message: 'Materia con código '+row['Materia']+ ' no fue encontrado. Verifique que los datos ingresados sean correctos.' });
                    } else {
                        row['Materia_ID'] = found._id;
                        wCallback();
                    }
                });
            }
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombre']) && NAME_REGEX.test(row['Nombre']));
            let error = valid ? null : { message: 'Campo \'Nombre\' tiene un valor inválido.' };
            wCallback(error);
        }
    ], callback);
}