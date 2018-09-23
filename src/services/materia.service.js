const Materia = require('../models/materia').Materia;
const Carrera = require('../models/carrera').Carrera;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.retrieveSubjectsByCarrer = (carrer_id, callback) => {

    Carrera.findOne({ _id: carrer_id })
            .populate('materias')
            .exec((error, carrera) => {
                if (error) {
                    callback(error);
                } else if (carrera) {
                    callback(null, carrera.materias);
                } else {
                    callback(null, null);
                }
            });
};