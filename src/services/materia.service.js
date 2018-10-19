const Materia = require('../models/materia').Materia;
const Carrera = require('../models/carrera').Carrera;
const InscripcionCurso = require('../models/inscripcion-curso');
const Curso = require('../models/curso');
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.retrieveSubjectsByCarrer = (user, carrer_id, checkInscriptions, callback) => {

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
        },
        (subjects, wCallback) => {
            if (subjects) {
                if (checkInscriptions) {
                    let query = { alumno: user._id }
                    InscripcionCurso.findNoPopulate(query, (error, inscriptions) => {
                        let filtered = null;
                        if (inscriptions) {
                            let insc_subject_ids = inscriptions.map((item) => { return item.materia.toString(); });
                            filtered = subjects.filter((item) => {
                                return (insc_subject_ids.indexOf(item._id.toString()) == -1);
                            });
                        }
                        wCallback(error, filtered);
                    });
                } else {
                    wCallback(null, subjects);
                }
            } else {
                wCallback(null, null);
            }
        }
    ], callback);
};

module.exports.import = (rows, callback) => {
    let batch = Materia.collection.initializeUnorderedBulkOp();

    for (let row of rows) {
        let subject = {
            codigo: row['Departamento'] + '.' + row['Identificador'],
            subcodigo: row['Identificador'],
            nombre: row['Nombre'],
            creditos: parseInt(row['Créditos']),
            departamento: row['Departamento_ID']
        }
        batch.find({ codigo: subject.codigo }).upsert().updateOne({ $set: subject });
    }

    batch.execute(callback);
}