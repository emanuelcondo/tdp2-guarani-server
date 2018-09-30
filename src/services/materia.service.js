const Materia = require('../models/materia').Materia;
const Carrera = require('../models/carrera').Carrera;
const Curso = require('../models/curso');
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.retrieveSubjectsByCarrer = (carrer_id, callback) => {

    async.waterfall([
        (wCallback) => {
            Carrera.findOne({ _id: carrer_id })
                    .populate('materias')
                    .exec(wCallback);
        },
        (carrer, wCallback) => {
            if (carrer) {
                let subject_ids = carrer.materias.map((item) => { return item._id; });
                let query = { materia: { $in: subject_ids } }
                Curso.findNoPopulate(query, (error, courses) => {
                    wCallback(error, carrer.materias, courses);
                });
            } else {
                wCallback(null, null);
            }
        },
        (subjects, courses, wCallback) => {
            if (subjects) {
                let subjectsWithCourses = courses.map((item) => { return item.materia.toString(); });
                let availableSubjects = subjects.filter((item) => { return subjectsWithCourses.indexOf(item._id.toString()) > -1; });
                availableSubjects.sort((a,b) => {
                    let cod_a = a.codigo;
                    let cod_b = b.codigo;
                    return (cod_a > cod_b ? 1 : -1);
                });
                wCallback(null, availableSubjects);
            } else {
                wCallback(null, null);
            }
        }
    ], callback);
};