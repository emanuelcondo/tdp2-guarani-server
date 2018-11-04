const mongoose = require('mongoose');

const DEPARTAMENTO_USER_SCHEMA = mongoose.Schema({
    'nombre' : {
        type: String,
        required: true
    },
    'apellido' : {
        type: String,
        required: true
    },
    'dni': {
        type: String,
        required: true,
        unique: true
    },
    'password': {
        type: String,
        required: true
    },
    'lastLogin': Date,
    'lastLogout': Date
});

DEPARTAMENTO_USER_SCHEMA.index({ dni: 1 });

const DepartamentoUser = mongoose.model('DepartamentoUser', DEPARTAMENTO_USER_SCHEMA);

module.exports.DepartamentoUser = DepartamentoUser;