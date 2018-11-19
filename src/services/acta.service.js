const routes = require('../routes/routes');
const logger = require('../utils/logger');
const Constants = require('../utils/constants');
const Acta = require('../models/acta');
const Examen = require('../models/examen');
const InscripcionExamen = require('../models/inscripcion-examen');
const ObjectId = require('mongoose').mongo.ObjectId;
const async = require('async');

module.exports.checkExamRecordExists = () => {
    return (req, res, next) => {
        let exam_id = ObjectId(req.params.examen);

        Acta.findOne({ examen: exam_id }, (error, found) => {
            if (error) {
                logger.error('[docentes][mis-examenes][check-acta-existente] '+error);
                return routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (found) {
                return routes.doRespond(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, { message: 'Ya se ha generado un acta asociada al examen ' + req.params.examen + '.' });
            } else {
                return next();
            }
        });
    }
}

module.exports.processExamRecords = (exam_id, records, callback) => {
    let acta = {
        examen: null,
        codigo: '',
        registros: [],
        createdAt: null
    };

    async.parallel({
        exam: (cb) => {
            Examen.findOne({ _id: exam_id }, cb);
        },
        inscriptions: (cb) => {
            let query = { examen: ObjectId(exam_id) };
            InscripcionExamen.findExamInscriptionsWithUser(query, cb);
        }
    }, (asyncError, result) => {
        if (result && result.exam && result.inscriptions) {
            let studentMap = {};
            for (let record of records) {
                let legajo = parseInt(record.alumno);
                studentMap[legajo] = {
                    notaExamen: parseInt(record.notaExamen),
                    notaCierre: parseInt(record.notaCierre)
                }
            }

            let exam = result.exam;
            let departament = exam.materia.departamento;

            acta.examen = exam._id;
            acta.createdAt = exam.fecha;

            let inscriptions = result.inscriptions;
            let inscriptionsToUpdate = [];

            for (let inscription of inscriptions) {
                let alumno = inscription.alumno;
                let legajo = alumno.legajo;
                if (studentMap[legajo]) {
                    acta.registros.push({
                        alumno: legajo,
                        inscripcionExamen: inscription._id,
                        nota: studentMap[legajo].notaCierre
                    });

                    inscriptionsToUpdate.push({
                        inscription: inscription._id,
                        notaExamen: studentMap[legajo].notaExamen
                    });
                }
            }

            async.each(inscriptionsToUpdate, (item, cb) => {
                let query = { _id: item.inscription };
                let update = { $set: { notaExamen: item.notaExamen } };
                InscripcionExamen.updateOneExamInscription(query, update, cb);
            }, (asyncEachError) => {
                if (asyncEachError) {
                    callback(asyncEachError, null);
                } else {
                    let libro = departament.codigo.toString();
                    let folio = '0000' + Date.now().toString().substr(-4);
                    acta.codigo = libro + '-' + folio;

                    Acta.create(acta, (error, created) => {
                        let data = null;
                        if (created) {
                            data = {
                                codigo: created.codigo,
                                registros: created.registros.map((item) => {
                                    return {
                                        alumno: {
                                            legajo: item.alumno.legajo,
                                            nombre: item.alumno.nombre,
                                            apellido: item.alumno.apellido
                                        },
                                        nota: item.nota
                                    }
                                })
                            }
                        }
                        callback(error, data);
                    });
                }
            });

        } else {
            callback(asyncError, null);
        }
    });
}