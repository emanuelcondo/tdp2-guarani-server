const Admin = require('../models/admin').Admin;
const DepartamentoUser = require('../models/departamento-user').DepartamentoUser;
const Docente = require('../models/docente').Docente;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const AuthService = require('./auth.service');
const async = require('async');

const DOCENTE_ROLE = 'docente';
const DEPARTAMENTO_ROLE = 'departamento';
const ADMIN_ROLE = 'admin';

module.exports.authenticateUser = (user, password, callback) => {
    let query = { dni: user };
    async.parallel({
        admin: (cb) => {
            Admin.findOne(query, cb);
        },
        departamentUser: (cb) => {
            DepartamentoUser.findOne(query, cb);
        },
        professor: (cb) => {
            Docente.findOne(query, cb);
        }
    }, (asyncError, result) => {
        if (asyncError) {
            callback(asyncError);
        } else if (result.admin || result.departamentUser || result.professor) {
            let role, Model, found;
            if (result.admin) {
                role = ADMIN_ROLE;
                Model = Admin;
                found = result.admin;
            } else if (result.departamentUser) {
                role = DEPARTAMENTO_ROLE;
                Model = DepartamentoUser;
                found = result.departamentUser;
            } else {
                role = DOCENTE_ROLE;
                Model = Docente;
                found = result.professor;
            }

            let isMatch = AuthService.comparePassword(password, found.password);
            if (isMatch) {
                Model.findOneAndUpdate(query, { lastLogin: new Date() }, { new: true }, (error, updated) => {
                    if (updated) {
                        updated['role'] = role;
                    }
                    callback(error, updated);
                });
            } else {
                callback(null, null);
            }
        } else {
            callback(null, null);
        }
    });
}

module.exports.logout = (user_id, callback) => {
    let query = { _id: user_id };
    let update = { lastLogout: new Date() };
    async.parallel({
        admin: (cb) => {
            Admin.updateOne(query, update, cb);
        },
        professor: (cb) => {
            Docente.updateOne(query, update, cb);
        }
    }, callback);
}