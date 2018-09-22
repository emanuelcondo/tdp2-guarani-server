const mongoose = require('mongoose');

const CARRERA_SCHEMA = mongoose.Schema({
    'codigo' : {
        type: Number,
        min: 0,
        unique: true,
        required: true
    },
    'nombre' : {
        type: String,
        required: true
    }
});

const Carrera = mongoose.model('Carrera', CARRERA_SCHEMA);

module.exports.Carrera = Carrera;