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
            'alumno': { type: ObjectId, ref: 'Alumno', required: true },
            'inscripcionExamen': { type: ObjectId, ref: 'InscripcionExamen', required: true },
            'nota': { type: Number, min: 2, max: 10 }
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
            Acta.findOne({ _id: created._id })
                .populate({
                    path: 'registros.alumno',
                    select: 'legajo nombre apellido'
                })
                .exec(callback);
        } else {
            callback(error, created);
        }
    });
}

module.exports.findOne = (query, callback) => {
    Acta.findOne(query, callback);
}