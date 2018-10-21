require('../models/carrera');
const Alumno = require('../models/alumno').Alumno;
const Sede = require('../models/sede').Sede;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');
const Hash = require('../utils/hash');

const SALT_WORK_FACTOR = 10;

module.exports.authenticateUser = (user, password, callback) => {
    Alumno.findOne({ dni: user }, (error, found) => {
        if (error) {
            callback(error);
        } else if (!found) {
            callback(null, null);
        } else {
            found.comparePassword(password, (err, isMatch) => {
                if (err) {
                    callback(err);
                } else if (isMatch) {
                    Alumno.findOneAndUpdate({ dni: user }, { lastLogin: new Date() }, { new: true }, callback);
                } else {
                    callback(null, null);
                }
            });
        }
    });
}

module.exports.logout = (user_id, callback) => {
    Alumno.updateOne({ _id: user_id }, { lastLogout: new Date() }, callback);
}

module.exports.findUserById = (user_id, callback) => {
    Alumno.findById(user_id, '-password')
            .populate('carreras', 'codigo nombre')
            .exec(callback);
}

module.exports.import = (rows, callback) => {
    const bulkOps = [];
    const dni_list = [];

    async.each(rows, (row, cb) => {
        let user = {
            legajo: parseInt(row['Padrón']),
            nombre: row['Nombres'],
            apellido: row['Apellidos'],
            dni: row['DNI'],
            carreras: row['Carreras'],
            prioridad: parseInt(row['Prioridad'])
        };

        let upsertDoc = {
            updateOne: {
                filter: { dni: user.dni },
                update: { $set: user },
                upsert: true
            }
        }

        dni_list.push(user.dni);
        bulkOps.push(upsertDoc);

        cb();
    }, (asyncError) => {
        if (asyncError) {
            callback(asyncError);
        } else {
            Alumno.collection.bulkWrite(bulkOps)
                .then( bulkWriteOpResult => {
                    _generatePasswordsInBackground(dni_list);
                    callback(null, bulkWriteOpResult);
                })
                .catch( err => {
                    callback(err);
                });
        }
    });
}

function _generatePasswordsInBackground(dni_list) {
    const bulkOps = [];

    logger.debug('[importacion][alumnos][import][passwords][background] Generando passwords en background...');
    async.each(dni_list, (dni, cb) => {
        Hash.generateHash(SALT_WORK_FACTOR, dni, (error, hashedPassword) => {
            if (error) {
                logger.debug('[importacion][alumnos][import][password][background] DNI: '+dni+' . Error: ' + error);
            } else {
                let upsertOne = {
                    updateOne: {
                        filter: { dni: dni },
                        update: { $set: { password: hashedPassword } }
                    }
                }
                bulkOps.push(upsertOne);
            }
            cb();
        });
    }, (asyncError) => {
        logger.debug('[importacion][alumnos][import][passwords][background] Bulk Write: iniciando...');
        Alumno.collection.bulkWrite(bulkOps)
            .then(bulkWriteOpResult => {
                logger.debug('[importacion][alumnos][import][passwords][background] Bulk Write: finalizado correctamente.');
            })
            .catch(error => {
                logger.debug('[importacion][alumnos][import][passwords][background] Bulk Write: Un error ocurrió. ' + error);
            });
    });
}