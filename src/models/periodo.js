const mongoose = require('mongoose');

const RANGO_SCHEMA = mongoose.Schema({
    'inicio': {
        type: Date,
        required: true
    },
    'fin': {
        type: Date,
        required: true
    }
});

const PERIODO_SCHEMA = mongoose.Schema({
    'cuatrimestre': {
        type: Number,
        required: true,
        min: 0,
        max: 2
    },
    'anio': {
        type: Number,
        required: true,
        min: 1900
    },
    'inscripcionCurso': {
        type: RANGO_SCHEMA,
        required: true
    },
    'desinscripcionCurso': {
        type: RANGO_SCHEMA,
        required: true
    },
    'cursada': {
        type: RANGO_SCHEMA,
        required: true
    },
    'consultaPrioridad': {
        type: RANGO_SCHEMA,
        required: true
    }
});

PERIODO_SCHEMA.index({ anio: 1, cuatrimestre: 1 });

const Periodo = mongoose.model('Periodo', PERIODO_SCHEMA);

module.exports.Periodo = Periodo;