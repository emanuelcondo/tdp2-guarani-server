const InscripcionCurso = require('../models/inscripcion-curso');
const Encuesta = require('../models/encuesta');
const async = require('async');

module.exports.generateReport = (params, callback) => {
    callback(null, {});
}

module.exports.searchPendingSurveysForStudent = (params, callback) => {
    async.waterfall([
        (wCallback) => {
            let query = {
                alumno: params.alumno,
                cuatrimestre: params.cuatrimestre,
                anio: params.anio,
                encuestaCompleta: false
            };
            InscripcionCurso.findInscriptions(query, wCallback);
        },
        (inscriptions, wCallback) => {
            let result = [];
            for (let inscription of inscriptions) {
                let course = inscription.curso;
                if (course) {
                    course.materia = inscription.materia;
                    result.push({
                        _id: course._id,
                        comision: course.comision,
                        cuatrimestre: course.cuatrimestre,
                        anio: course.anio,
                        materia: {
                            _id: course.materia._id,
                            codigo: course.materia.codigo,
                            nombre: course.materia.nombre
                        },
                        docenteACargo: course.docenteACargo,
                        jtp: course.jtp,
                        ayudantes: course.ayudantes
                    });
                }
            }
            wCallback(null, { cursos: result });
        }
    ], callback);
}

module.exports.createSurvey = (user_id, course_id, body, callback) => {
    callback(null, { message: "La encuesta ha sido completada con éxito." });
}