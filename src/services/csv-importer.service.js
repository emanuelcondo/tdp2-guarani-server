const fs = require('fs');
const csv = require('fast-csv');
const logger = require('../utils/logger');
const async = require('async');
const Utils = require('../utils/utils');
const Carrera = require('../models/carrera');

const IMPORT_HEADERS = {
    alumnos: ['Padrón', 'DNI', 'Nombres', 'Apellidos', 'Carreras', 'Prioridad'],
    docentes: ['DNI', 'Nombres', 'Apellidos'],
    carreras: ['Identificador', 'Nombre'],
    departamentos: ['Identificador', 'Nombre'],
    materias: ['Departamento','Identificador','Nombre'],
    aula: ['Sede','Aula']
}

const IMPORT_TYPES = {
    ALUMNO: 'alumnos',
    DOCENTE: 'docentes',
    CARRERA: 'carreras',
    DEPARTAMENTO: 'departamentos',
    MATERIA: 'materias',
    AULA: 'aulas'
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
            return callback(null, { message: 'error' });
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
            async.eachOfSeries(rows, (row, index, cb) => {
                _validateStudentRow(row, (error) => {
                    let result = null;
                    if (error) {
                        result = { row: index + 1, message: error.message }
                    }
                    cb(result);
                });
            }, (asyncError) => {
                wCallback(asyncError, rows);
            });
        },
        (rows, wCallback) => {
            wCallback(null, { cantidadRegistrosImportados: rows.length });
        }
    ], callback);
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
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Nombres']) && /^[a-zA-Z\ ]+$/.test(row['Nombres']));
            let error = valid ? null : { message: 'Campo \'Nombres\' tiene un valor inválido.' };
            wCallback(error);
        },
        (wCallback) => {
            let valid = (Utils.isString(row['Apellidos']) && /^[a-zA-Z\ ]+$/.test(row['Apellidos']));
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
                                for (let id of carrers) {
                                    let found = result.find((item) => { return item.codigo == id; });
                                    if (!found) error_msg = 'Campo \'Carreras\' tiene un valor inválido. Carrera con código \'' + id + '\' no encontrado.'
                                }

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
    ], callback);
}

/* DOCENTES */
function _processProfessors (filepath, callback) {
    callback();
}

/* CARRERAS */
function _processCarrers (filepath, callback) {
    callback();
}

/* DEPARTAMENTOS */
function _processDepartaments (filepath, callback) {
    callback();
}

/* MATERIAS */
function _processSubjects (filepath, callback) {
    callback();
}

/* AULAS */
function _processClassrooms (filepath, callback) {
    callback();
}