const Docente = require('../models/docente').Docente;
const InscripcionCursoService = require('./inscripcion-curso.service');
const Curso = require('../models/curso');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');
const Hash = require('../utils/hash');

const SALT_WORK_FACTOR = 10;

const csv = require('fast-csv');
const fs = require('fs');

module.exports.authenticateUser = (user, password, callback) => {
    Docente.findOne({ dni: user }, (error, found) => {
        if (error) {
            callback(error);
        } else if (!found) {
            callback(null, null);
        } else {
            found.comparePassword(password, (err, isMatch) => {
                if (err) {
                    callback(err);
                } else if (isMatch) {
                    Docente.findOneAndUpdate({ dni: user }, { lastLogin: new Date() }, { new: true }, callback);
                } else {
                    callback(null, null);
                }
            });
        }
    });
}

module.exports.logout = (user_id, callback) => {
    Docente.updateOne({ _id: user_id }, { lastLogout: new Date() }, callback);
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

    async.waterfall([
        (wCallback) => {
            Curso.findCourses(query, wCallback);
        },
        (courses, wCallback) => {
            let ids = courses.map((item) => { return item._id; });
            let _query = { curso: { $in: ids } }
            InscripcionCursoService.retrieveNoPopulate(_query, (error, inscriptions) => {
                let map = {};
                if (inscriptions) {
                    for (let inscription of inscriptions) {
                        let _id = inscription.curso.toString();
                        map[_id] = (map[_id] ? (map[_id] + 1) : 1);
                    }
                    for (let course of courses) {
                        let _id = course._id.toString();
                        course._doc['cantidadInscriptos'] = (map[_id] ? map[_id] : 0);
                    }
                }
                wCallback(error, courses);
            });
        }
    ], callback);
}

module.exports.retrieveCourseDetail = (course_id, download, callback) => {

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
        },
        (result, wCallback) => {
            if (download) {
                _generateStudentFile(result, wCallback);
            } else {
                wCallback(null, result);
            }
        }
    ], callback);
}

function _generateStudentFile (data, callback) {
    let downloadFolder = './downloads';
    if (!fs.existsSync(downloadFolder))
        fs.mkdirSync(downloadFolder);

    let filename = 'curso_'+data.curso.materia.codigo+'_'+data.curso.comision+'_'+Date.now().toString()+'.csv';
    let pathToDownload = 'downloads/'+filename;
    var csvStream = csv.createWriteStream({headers: true});
    var writableStream = fs.createWriteStream(pathToDownload);

    writableStream.on('finish', () => {
        callback(null, pathToDownload);
    });

    csvStream.pipe(writableStream);

    let inscriptions = [].concat(data.regulares).concat(data.condicionales);
    
    for (let inscription of inscriptions) {
        let json = {
            'Padrón': inscription.alumno.legajo,
            'Nombres': inscription.alumno.nombre,
            'Apellidos': inscription.alumno.apellido,
            'Carreras': '',
            'Prioridad': inscription.alumno.prioridad,
            'Condición': inscription.condicion
        }

        let append_carrers = [];
        for (let c of inscription.alumno.carreras) {
            append_carrers.push(c.nombre);
        }
        json['Carreras'] = '['+ append_carrers.join(', ') +']';

        csvStream.write(json);
    }

    csvStream.end();
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

module.exports.import = (rows, callback) => {
    let batch = Docente.collection.initializeUnorderedBulkOp();

    async.eachSeries(rows, (row, cb) => {
        let user = {
            nombre: row['Nombres'],
            apellido: row['Apellidos'],
            dni: row['DNI']
        };

        if (row['Password']) {
            Hash.generateHash(SALT_WORK_FACTOR, user.dni, (error, hashedPassword) => {
                if (error) {
                    cb(error);
                } else {
                    user['password'] = hashedPassword;
                    batch.find({ dni: user.dni }).upsert().updateOne({ $set: user });
                    cb();
                }
            });
        } else {
            batch.find({ dni: user.dni }).upsert().updateOne({ $set: user });
            cb();
        }
    }, (asyncError) => {
        if (asyncError) {
            callback(asyncError);
        } else {
            batch.execute(callback);
        }
    });
}