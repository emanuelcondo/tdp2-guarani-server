const bcrypt = require('bcrypt');

module.exports.generateHash = (salt_work_factor, input, callback) => {
    bcrypt.genSalt(salt_work_factor, (err, salt) => {
        if (err) {
            callback(err);
        } else {
            bcrypt.hash(input, salt, (error, hash) => {
                callback(error, hash);
            });
        }
    });
}