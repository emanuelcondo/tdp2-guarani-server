const mongoose = require('mongoose');

const SEDE_SCHEMA = mongoose.Schema({
    'codigo' : {
        type: String,
        unique: true,
        required: true
    },
    'nombre' : {
        type: String,
        required: true
    }
});

const Sede = mongoose.model('Sede', SEDE_SCHEMA);

/*
var sedePC = new Sede({
    codigo: 'PC',
    nombre: 'Paseo Colón'
});

var sedeLH = new Sede({
    codigo: 'LH',
    nombre: 'Las Heras'
});

sedePC.save();
sedeLH.save();
*/

module.exports.Sede = Sede;