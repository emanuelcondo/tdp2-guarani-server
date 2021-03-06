const InscripcionCurso = require('../models/inscripcion-curso');
const Departamento = require('../models/departamento').Departamento;
const Encuesta = require('../models/encuesta');
const Curso = require('../models/curso');
const ObjectId = require('mongoose').mongo.ObjectId;
const async = require('async');

module.exports.generateReport = (params, callback) => {
    let pipelines = [
        {
            $match: {
                departamento: params.departamento,
                cuatrimestre: params.cuatrimestre,
                anio: params.anio
            }
        },
        {
            $group: {
                _id: "$materia",
                nivel_general: { $avg: "$nivel_general" },
                nivel_teoricas: { $avg: "$nivel_teoricas" },
                nivel_practicas: { $avg: "$nivel_practicas" },
                nivel_temas: { $avg: "$nivel_temas" },
                nivel_actualizacion: { $avg: "$nivel_actualizacion" },
                comentarios: {
                    $push: "$comentario"
                }
            }
        },
        {
            $lookup: {
                from: 'materias',
                localField: "_id",
                foreignField: "codigo",
                as: "materia"
            }
        }
    ];
    Encuesta.aggregate(pipelines, (error, data) => {
        let result = [];
        if (data) {
            for (let item of data) {
                let materia = item.materia[0];
                let average = item.nivel_general.toFixed(2);//((item.nivel_general+item.nivel_teoricas+item.nivel_practicas+item.nivel_temas+item.nivel_actualizacion)/5).toFixed(2);
                let puntos = parseFloat(average);
                result.push({
                    _id: materia._id,
                    codigo: materia.codigo,
                    nombre: materia.nombre,
                    puntos: puntos,
                    comentarios: item.comentarios
                });
            }
            result.sort((a,b) => { return (a.puntos > b.puntos ? -1 : 1); });
        }
        callback(error, result);
    });
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
                Curso.findOneCourse({ _id: ObjectId(params.curso)}, (error, found) => {
                    if (found) {
                        Departamento.findOne({ _id: found.materia.departamento }, (error, departament) => {
                            found.materia.departamento = departament;
                            wCallback(error, found);
                        });
                    } else {
                        wCallback(error, null);
                    }
                });
            else
                wCallback(null, null);
        },
        (course, wCallback) => {
            if (course) {
                survey.curso = course.comision;
                survey.materia = course.materia.codigo;
                survey.departamento = course.materia.departamento.codigo;

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