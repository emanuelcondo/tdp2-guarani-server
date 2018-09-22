const mongoose = require('mongoose');

const CARRERA_SCHEMA = mongoose.Schema({
    'codigo' : {
        type: Number,
        min: 0,
        unique: true,
        required: true
    },
    'nombre' : {
        type: String,
        required: true
    },
    'materias': [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Materia'
        }
    ]
});

const Carrera = mongoose.model('Carrera', CARRERA_SCHEMA);

module.exports.Carrera = Carrera;