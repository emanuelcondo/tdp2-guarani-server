const Docente = require('../models/docente').Docente;
const InscripcionCursoService = require('./inscripcion-curso.service');
const Curso = require('../models/curso');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.authenticateUser = (user, password, callback) => {
    Docente.findOne({ dni: user }, (error, found) => {
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
    Docente.findById(user_id, '-password', callback);
}

module.exports.retrieveMyCourses = (user_id, callback) => {
    let user = ObjectId(user_id);
    let query = {
        $or: [
            { docenteACargo: user },
            { jtp: user },
            { ayudantes: user }
        ]
    };
    Curso.findCourses(query, callback);
}

module.exports.retrieveCourseDetail = (course_id, callback) => {

    async.waterfall([
        (wCallback) => {
            Curso.findOneCourse({ _id: course_id }, wCallback);
        },
        (curso, wCallback) => {
            if (curso) {
                let query = {
                    $or: [
                        { curso: curso._id },
                        { materia: curso.materia._id }
                    ]
                }
                InscripcionCursoService.retrieveInscriptionsWithDetail(query, (error, records) => {
                    wCallback(error, curso, records);
                });
            } else {
                wCallback(null, null);
            }
        },
        (curso, records, wCallback) => {
            let result = null;
            if (curso && records) {
                let regulares = [];
                let condicionales = [];
                for (let record of records) {
                    if (record.condicion == "Regular")
                        regulares.push(record);
                    else if (record.condicion == "Condicional")
                        condicionales.push(record);
                }
                result = {
                    curso: curso,
                    regulares: regulares,
                    condicionales: condicionales
                }
            }
            wCallback(null, result);
        }
    ], callback);
}

module.exports.registerConditionalStudents = (course, students, callback) => {
    // removes duplicates
    students = students.filter((id, index) => { return students.indexOf(id) == index; });

    let query = {
        materia: course.materia,
        alumno: { $in: students }
    };

    let data = {
        curso: course._id,
        condicion: "Regular",
        exCondicional: true
    };

    async.waterfall([
        (wCallback) => {
            InscripcionCursoService.updateInscriptions(query, data, wCallback);
        },
        (result, wCallback) => {
            let _query = {
                curso: course._id,
                alumno: { $in: students },
                exCondicional: true
            };
            InscripcionCursoService.retrieveInscriptionsWithDetail(query, wCallback);
        }
    ], callback);
}