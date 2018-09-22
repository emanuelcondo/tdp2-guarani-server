const Admin = require('../models/admin').Admin;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.authenticateUser = (user, password, callback) => {
    Admin.findOne({ dni: user }, (error, found) => {
        if (error) {
            callback(error);
        } else if (!found) {
            callback(null, null);
        } else {
            found.comparePassword(password, (err, isMatch) => {
                if (err) callback(err);
                else if (isMatch) callback(null, found);
                else callback(null, null);
            });
        }
    });
}

module.exports.findUserById = (user_id, callback) => {
    Admin.findById(user_id, '-password', callback);
}