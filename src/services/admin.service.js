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
                if (err) {
                    callback(err);
                } else if (isMatch) {
                    Admin.findOneAndUpdate({ dni: user }, { lastLogin: new Date() }, { new: true }, callback);
                } else {
                    callback(null, null);
                }
            });
        }
    });
}

module.exports.logout = (user_id, callback) => {
    Admin.updateOne({ _id: user_id }, { lastLogout: new Date() }, callback);
}

module.exports.findUserById = (user_id, callback) => {
    Admin.findById(user_id, '-password', callback);
}