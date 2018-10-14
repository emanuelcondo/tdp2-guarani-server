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
    let batch = Alumno.collection.initializeUnorderedBulkOp();

    async.eachSeries(rows, (row, cb) => {
        let user = {
            legajo: parseInt(row['Padrón']),
            nombre: row['Nombres'],
            apellido: row['Apellidos'],
            dni: row['DNI'],
            carreras: row['Carreras'],
            prioridad: parseInt(row['Prioridad'])
        };

        if (row['Password']) {
            Hash.generateHash(SALT_WORK_FACTOR, user.dni, (error, hashedPassword) => {
                if (error) {
                    cb(error);
                } else {
                    user['password'] = hashedPassword;
                    batch.find({ dni: user.dni }).upsert().updateOne({ $set: user });
                    cb();
                }
            });
        } else {
            batch.find({ dni: user.dni }).upsert().updateOne({ $set: user });
            cb();
        }
    }, (asyncError) => {
        if (asyncError) {
            callback(asyncError);
        } else {
            batch.execute(callback);
        }
    });
}