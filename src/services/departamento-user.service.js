const DepartamentoUser = require('../models/departamento-user').DepartamentoUser;

module.exports.findUserById = (user_id, callback) => {
    DepartamentoUser.findById(user_id, '-password', callback);
}

module.exports.logout = (user_id, callback) => {
    DepartamentoUser.updateOne({ _id: user_id }, { lastLogout: new Date() }, callback);
}