const InscripcionCurso = require('../models/inscripcion-curso');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.retrieveMyRegisters = (user_id, callback) => {
    let query = { alumno: ObjectId(user_id) };

    InscripcionCurso.findRegisters(query, callback);
};

module.exports.deleteRegister = (user_id, curso, callback) => {
    let query = { alumno: ObjectId(user_id), curso: ObjectId(curso) };
    InscripcionCurso.deleteRegister(query, callback);
};