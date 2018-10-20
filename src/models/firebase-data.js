const mongoose = require('mongoose');

const FIREBASE_DATA_SCHEMA = mongoose.Schema({
    'user' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    'token': {
        type: String,
        required: true,
    }
});

FIREBASE_DATA_SCHEMA.index({user: 1, token: 1});

const FirebaseData = mongoose.model('FirebaseData', FIREBASE_DATA_SCHEMA);

module.exports.FirebaseData = FirebaseData;