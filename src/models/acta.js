const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const ACTA_SCHEMA = mongoose.Schema({
    'codigo': {
        type: String,
        required: true,
        unique: true
    },
    'examen': {
        type: ObjectId,
        required: true,
        ref: 'Examen',
        unique: true
    },
    'registros': [
        {
            'alumno': { type: Number, ref: 'Alumno', required: true },
            'inscripcionExamen': { type: ObjectId, ref: 'InscripcionExamen', required: true },
            'nota': { type: String, enum: [ 'D', '2', '3', '4', '5', '6', '7', '8', '9', '10' ] }
            //'nota': { type: Number, min: 2, max: 10 }
        }
    ],
    'createdAt': {
        type: Date,
        default: Date.now
    }
});

ACTA_SCHEMA.index({ codigo: 1 });

const Acta = mongoose.model('Acta', ACTA_SCHEMA);

module.exports.Acta = Acta;

module.exports.create = (acta, callback) => {
    Acta.create(acta, (error, created) => {
        if (created) {
            let pipelines = [
                { 
                    $match: {
                        '_id': created._id
                    }
                },
                {
                    $lookup: {
                        from: 'alumnos',
                        localField: 'registros.alumno',
                        foreignField: 'legajo',
                        as: 'alumnos'
                    }
                }
            ];
            Acta.aggregate(pipelines).exec((error, result) => {
                let data = null;
                if (result && result.length) {
                    let acta = result[0];
                    let studentMap = {};
                    for (let item of acta.alumnos) {
                        let legajo = item.legajo;
                        studentMap[legajo] = {
                            legajo: legajo,
                            nombre: item.nombre,
                            apellido: item.apellido
                        }
                    }

                    data = {
                        codigo: acta.codigo,
                        registros: acta.registros.map((item) => {
                            let legajo = item.alumno;
                            return {
                                alumno: studentMap[legajo],
                                nota: isNaN(item.nota) ? item.nota : parseInt(item.nota)
                            }
                        })
                    }

                }
                callback(error, data);
            });
        } else {
            callback(error, created);
        }
    });
}

module.exports.findOne = (query, callback) => {
    Acta.findOne(query, callback);
}