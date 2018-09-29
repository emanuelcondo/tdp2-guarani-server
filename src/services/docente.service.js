const Docente = require('../models/docente').Docente;
const InscripcionCurso = require('../models/inscripcion-curso');
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
                InscripcionCurso.findInscriptionsWithUser(query, (error, records) => {
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