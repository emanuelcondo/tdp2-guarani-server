const mongoose = require('mongoose');

const INSCRIPCION_EXAMEN_SCHEMA = mongoose.Schema({
    'examen' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examen'
    },
    'alumno' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Alumno'
    },
    'condicion': {
        type: String,
        required: true,
        enum: [ "Regular", "Libre" ]
    },
    'timestamp' : {
        type: Date,
        default: Date.now
    }
});

const InscripcionExamen = mongoose.model('InscripcionExamen', INSCRIPCION_EXAMEN_SCHEMA);

module.exports.InscripcionExamen = InscripcionExamen;