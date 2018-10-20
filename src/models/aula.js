const mongoose = require('mongoose');

const AULA_SCHEMA = mongoose.Schema({
    'sede' : {
        type: String,
        required: true,
        enum: ['CU', 'LH', 'PC']
    },
    'aula' : {
        type: String,
        required: true
    },
    'capacidad': {
        type: Number,
        required: true,
        min: 1
    }
});

AULA_SCHEMA.index({sede: 1, aula: 1}, {unique: true});

const Aula = mongoose.model('Aula', AULA_SCHEMA);

module.exports.Aula = Aula;