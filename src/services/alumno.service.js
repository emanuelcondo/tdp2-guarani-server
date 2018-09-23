require('../models/carrera');
const Alumno = require('../models/alumno').Alumno;
const Sede = require('../models/sede').Sede;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.authenticateUser = (user, password, callback) => {
    Alumno.findOne({ dni: user }, (error, found) => {
        if (error) {
            callback(error);
        } else if (!found) {
            callback(null, null);
        } else {
            found.comparePassword(password, (err, isMatch) => {
                if (err) callback(err);
                else if (isMatch) callback(null, found);
                else callback(null, null);
            });
        }
    });
}

module.exports.findUserById = (user_id, callback) => {
    Alumno.findById(user_id, '-password')
            .populate('carreras', 'codigo nombre')
            .exec(callback);
}