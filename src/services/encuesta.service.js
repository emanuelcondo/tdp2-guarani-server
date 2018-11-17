const InscripcionCurso = require('../models/inscripcion-curso');
const Encuesta = require('../models/encuesta');
const Curso = require('../models/curso');
const ObjectId = require('mongoose').mongo.ObjectId;
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

module.exports.createSurvey = (params, callback) => {
    let survey = {
        curso: null,
        materia: null,
        departamento: null,
        nivel_general: params.body.nivel_general,
        nivel_teoricas: params.body.nivel_teoricas,
        nivel_practicas: params.body.nivel_practicas,
        nivel_temas: params.body.nivel_temas,
        nivel_actualizacion: params.body.nivel_actualizacion,
        comentario: (params.body.comentario && params.body.comentario.trim().length > 0) ? params.body.comentario.trim() : '',
        cuatrimestre: params.periodo.cuatrimestre,
        anio: params.periodo.anio
    }

    async.waterfall([
        (wCallback) => {
            let query = {
                alumno: params.alumno,
                curso: ObjectId(params.curso),
                cuatrimestre: params.periodo.cuatrimestre,
                anio: params.periodo.anio,
                encuestaCompleta: false
            };
            let update = {
                $set: { encuestaCompleta: true }
            }
            InscripcionCurso.updateOneInscription(query, update, wCallback);
        },
        (updated, wCallback) => {
            if (updated)
                Curso.findOneCourse({ _id: ObjectId(params.curso)}, wCallback);
            else
                wCallback(null, null);
        },
        (course, wCallback) => {
            if (course) {
                survey.curso = course._id;
                survey.materia = course.materia._id;
                survey.departamento = course.materia.departamento;

                Encuesta.createSurvey(survey, (error, created) => {
                    let result = created ? { message: "La encuesta ha sido completada con éxito." } : null;
                    wCallback(error, result);
                });
            } else {
                wCallback(null, null);
            }
        }
    ], callback);
}