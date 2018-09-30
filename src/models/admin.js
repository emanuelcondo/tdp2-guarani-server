const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const DOCENTE_SCHEMA = mongoose.Schema({
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

DOCENTE_SCHEMA.pre('save', function (next) {
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

DOCENTE_SCHEMA.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, cb);
};

DOCENTE_SCHEMA.index({ dni: 1 });

const Admin = mongoose.model('Admin', DOCENTE_SCHEMA);

/*
// create a user a new user
var testUser = new Admin({
    nombre: 'Administrador',
    apellido: 'Admin',
    dni: '1111111',
    password: '1234'
});

// save user to database
testUser.save(function(err) {
    if (err) throw err;
});
*/


module.exports.Admin = Admin;