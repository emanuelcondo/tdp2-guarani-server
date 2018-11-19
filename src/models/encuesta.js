const mongoose = require('mongoose');

const ENCUESTA_SCHEMA = mongoose.Schema({
    'curso': {
        type: Number,
        required: true
    },
    'materia' : {
        type: String,
        required: true,
        ref: 'Materia'
    },
    'departamento' : {
        type: Number,
        required: true,
        ref: 'Departamento'
    },
    'nivel_general': { type: Number, required: true, min: 1, max: 5 },
    'nivel_teoricas': { type: Number, required: true, min: 1, max: 5 },
    'nivel_practicas': { type: Number, required: true, min: 1, max: 5 },
    'nivel_temas': { type: Number, required: true, min: 1, max: 5 },
    'nivel_actualizacion': { type: Number, required: true, min: 1, max: 5 },
    'comentario': String,
    'cuatrimestre': {
        type: Number,
        required: true
    },
    'anio': {
        type: Number,
        required: true
    }
});

const Encuesta = mongoose.model('Encuesta', ENCUESTA_SCHEMA);

module.exports.Encuesta = Encuesta;

module.exports.createSurvey = (body, callback) => {
    Encuesta.create(body, callback);
}

module.exports.aggregate = (pipelines, callback) => {
    Encuesta.aggregate(pipelines, callback);
}