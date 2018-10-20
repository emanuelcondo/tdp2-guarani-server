const mongoose = require('mongoose');

const DEPARTAMENTO_SCHEMA = mongoose.Schema({
    'codigo': {
        type: Number,
        unique: true,
        required: true,
        min: 0
    },
    'nombre' : {
        type: String,
        required: true
    }
});

const Departamento = mongoose.model('Departamento', DEPARTAMENTO_SCHEMA);

module.exports.Departamento = Departamento;