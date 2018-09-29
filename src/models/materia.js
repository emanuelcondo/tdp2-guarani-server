const mongoose = require('mongoose');

const MATERIA_SCHEMA = mongoose.Schema({
    'codigo': {
        type: String,
        unique: true,
        required: true
    },
    'subcodigo' : {
        type: String,
        required: true
    },
    'nombre' : {
        type: String,
        required: true
    },
    'creditos' : {
        type: Number,
        required: true,
        min: 1,
        max: 24
    },
    'departamento' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Departamento'
    }
});

const Materia = mongoose.model('Materia', MATERIA_SCHEMA);

module.exports.Materia = Materia;

module.exports.findSubjects = (query, callback) => {
    Materia.find(query, callback);
}