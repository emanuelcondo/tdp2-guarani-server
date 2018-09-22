const mongoose = require('mongoose');

const MATERIA_SCHEMA = mongoose.Schema({
    'legajo': {
        type: Number,
        unique: true,
        required: true,
        min: 1
    },
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
    }
});

const Materia = mongoose.model('Materia', MATERIA_SCHEMA);

/*
// create a user a new user
var testUser = new Alumno({
    legajo: 100000,
    nombre: 'AAA',
    apellido: 'ZZZ',
    dni: '1111111',
    password: '1234'
});

// save user to database
testUser.save(function(err) {
    if (err) throw err;
});
*/

module.exports.Materia = Materia;