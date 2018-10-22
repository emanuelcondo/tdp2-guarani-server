const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const AuthService = require('../services/aula.service');

const ALUMNO_SCHEMA = mongoose.Schema({
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
    },
    'carreras': [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Carrera'
        }
    ],
    'prioridad': {
        type : Number,
        min : 1,
    },
    'lastLogin': Date,
    'lastLogout': Date
});
/*
ALUMNO_SCHEMA.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password'))
        return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            next(err);
        } else {
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    next(err);
                } else {
                    // override the cleartext password with the hashed one
                    user.password = hash;
                    next();
                }
            });
        }
    });
});
*/

ALUMNO_SCHEMA.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, cb);
};

ALUMNO_SCHEMA.index({ legajo: 1 });
ALUMNO_SCHEMA.index({ dni: 1 });

const Alumno = mongoose.model('Alumno', ALUMNO_SCHEMA);

module.exports.Alumno = Alumno;