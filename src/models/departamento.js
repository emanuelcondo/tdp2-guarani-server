const mongoose = require('mongoose');

const DEPARTAMENTO_SCHEMA = mongoose.Schema({
    'codigo': {
        type: String,
        unique: true,
        required: true
    },
    'nombre' : {
        type: String,
        required: true
    }
});

const Departamento = mongoose.model('Departamento', DEPARTAMENTO_SCHEMA);

module.exports.Departamento = Departamento;