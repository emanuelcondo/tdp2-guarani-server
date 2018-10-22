const Docente = require('../models/docente').Docente;
const FirebaseData = require('../models/firebase-data').FirebaseData;
const InscripcionCursoService = require('./inscripcion-curso.service');
const FirebaseService = require('../services/firebase.service');
const Curso = require('../models/curso');
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');
const Hash = require('../utils/hash');
const AuthService = require('./auth.service');

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
            let isMatch = AuthService.comparePassword(password, found.password);
            if (isMatch) {
                Docente.findOneAndUpdate({ dni: user }, { lastLogin: new Date() }, { new: true }, callback);
            } else {
                callback(null, null);
            }
            /*
            found.comparePassword(password, (err, isMatch) => {
                if (err) {
                    callback(err);
                } else if (isMatch) {
                    Docente.findOneAndUpdate({ dni: user }, { lastLogin: new Date() }, { new: true }, callback);
                } else {
                    callback(null, null);
                }
            });
            */
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
    ], (asyncError, result) => {
        if (asyncError) {
            callback(asyncError);
        } else {
            _notifyToStudents(students, course._id);
            callback(null, result);
        }
    });
}

function _notifyToStudents(student_ids, course_id) {
    async.parallel({
        firebaseData: (cb) => {
            let query = { user: { $in: student_ids } };
            FirebaseData.find(query, cb);
        },
        course: (cb) => {
            Curso.findOneCourse({ _id: course_id }, cb);
        }
    }, (asyncError, result) => {
        if (asyncError) {
            logger.error('[async][notificar][estudiantes][condicional-aceptado] '+error);
        } else {
            let course = result.course;
            for (let item of result.firebaseData) {
                let title = course.materia.codigo +' - curso '+course.comision+ ' - Condicionales';
                let body = 'Has sido inscripto como alumno regular en el curso '+course.comision+' de la materia ('+course.materia.codigo+') '+course.materia.nombre+'.';
                let recipient = item.token;
                FirebaseService.sendToParticular(title, body, recipient);
            }
        }
    });
}

module.exports.import = (rows, callback) => {
    const bulkOps = [];
    const dni_list = [];

    async.each(rows, (row, cb) => {
        let user = {
            nombre: row['Nombres'],
            apellido: row['Apellidos'],
            dni: row['DNI'],
            password: AuthService.createPasswordHash(row['DNI'])
        };

        let upsertDoc = {
            updateOne: {
                filter: { dni: user.dni },
                update: { $set: user },
                upsert: true
            }
        }

        dni_list.push(user.dni);
        bulkOps.push(upsertDoc);

        cb();
    }, (asyncError) => {
        if (asyncError) {
            callback(asyncError);
        } else {
            Docente.collection.bulkWrite(bulkOps)
                .then( bulkWriteOpResult => {
                    callback(null, bulkWriteOpResult);
                })
                .catch( err => {
                    callback(err);
                });
        }
    });
}

function _generatePasswordsInBackground(dni_list) {
    const bulkOps = [];

    logger.debug('[importacion][docentes][import][passwords][background] Generando passwords en background...');
    async.each(dni_list, (dni, cb) => {
        Hash.generateHash(SALT_WORK_FACTOR, dni, (error, hashedPassword) => {
            if (error) {
                logger.debug('[importacion][docentes][import][password][background] DNI: '+dni+' . Error: ' + error);
            } else {
                let upsertOne = {
                    updateOne: {
                        filter: { dni: dni },
                        update: { $set: { password: hashedPassword } }
                    }
                }
                bulkOps.push(upsertOne);
            }
            cb();
        });
    }, (asyncError) => {
        logger.debug('[importacion][docentes][import][passwords][background] Bulk Write: iniciando...');
        Docente.collection.bulkWrite(bulkOps)
            .then(bulkWriteOpResult => {
                logger.debug('[importacion][docentes][import][passwords][background] Bulk Write: finalizado correctamente.');
            })
            .catch(error => {
                logger.debug('[importacion][docentes][import][passwords][background] Bulk Write: Un error ocurrió. ' + error);
            });
    });
}