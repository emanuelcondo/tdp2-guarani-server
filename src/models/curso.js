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
    'cursada': [ CURSADA_SCHEMA ],
    'cupos': {
        type: Number,
        min: 1
    },
    'vacantes': {
        type: Number,
        min: 0
    }
});

const Curso = mongoose.model('Curso', CURSO_SCHEMA);

module.exports.Curso = Curso;

module.exports.findCourses = (query, callback) => {
    Curso.find(query)
        .populate('sede')
        .populate('materia')
        .populate('docenteACargo', 'nombre apellido')
        .populate('jtp', 'nombre apellido')
        .populate('ayudantes', 'nombre apellido')
        .exec(callback);
}

module.exports.findOneCourse = (query, callback) => {
    Curso.findOne(query)
        .populate('sede')
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