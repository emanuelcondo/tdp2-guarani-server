const mongoose = require('mongoose');

const DIAS_ENUM = [ "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ];

const CURSADA_ENUM = [
    "Teórica", "Teórica Obligatoria",
    "Práctica", "Práctica Obligatoria",
    "Teórica Práctica", "Teórica Práctica Obligatoria",
    "Desarrollo y Consultas",
];

const CURSADA_SCHEMA = mongoose.Schema({
    'aula': { type: String },
    'tipo': { type: String, required: true, enum: CURSADA_ENUM },
    'dia': { type: String, required: true, enum: DIAS_ENUM },
    'horario_desde': { type: String, required: true },
    'horario_hasta': { type: String, required: true }
});

const CURSO_SCHEMA = mongoose.Schema({
    'comision': {
        type: Number,
        required: true,
        min: 1
    },
    'materia' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Materia'
    },
    'sede' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Sede'
    },
    'docenteACargo' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Docente'
    },
    'jtp' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Docente'
    },
    'ayudantes': [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Docente' // Qué pasa con los Alumnos Ayudantes???
        }
    ],
    'cursada': [ CURSADA_SCHEMA ]
});

const Curso = mongoose.model('Curso', CURSO_SCHEMA);

module.exports.Curso = Curso;