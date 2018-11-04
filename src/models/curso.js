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
    'sede': { type: String, enum: [ 'CU', 'LH', 'PC' ] },
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
    'cursada': [ CURSADA_SCHEMA ],
    'cupos': {
        type: Number,
        min: 1
    },
    'vacantes': {
        type: Number,
        min: 0
    },
    'anio': {
        type: Number,
        required: true,
        min: 1900
    },
    'cuatrimestre': {
        type: Number,
        required: true,
        enum: [ 0, 1, 2] // Verano: 0, 1º Cuatri: 1, 2º Cuatri: 2
    }
});

const Curso = mongoose.model('Curso', CURSO_SCHEMA);

module.exports.Curso = Curso;

module.exports.findCourses = (query, callback) => {
    Curso.find(query)
        .populate('materia')
        .populate('docenteACargo', 'nombre apellido')
        .populate('jtp', 'nombre apellido')
        .populate('ayudantes', 'nombre apellido')
        .exec(callback);
}

module.exports.findOneCourse = (query, callback) => {
    Curso.findOne(query)
        .populate('materia')
        .populate('docenteACargo', 'nombre apellido')
        .populate('jtp', 'nombre apellido')
        .populate('ayudantes', 'nombre apellido')
        .exec(callback);
}

module.exports.findNoPopulate = (query, callback) => {
    Curso.find(query, callback);
}

module.exports.findOneNoPopulate = (query, callback) => {
    Curso.findOne(query, callback);
}

module.exports.updateCourse = (course_id, data, callback) => {
    Curso.findByIdAndUpdate(course_id, data, callback);
}

module.exports.createCourse = (body, callback) => {
    Curso.create(body, callback);
}

module.exports.removeCourse = (course_id, callback) => {
    Curso.findByIdAndRemove(course_id, callback);
}