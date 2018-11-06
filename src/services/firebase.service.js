const routes = require('../routes/routes');
const Constants = require('../utils/constants');
const FirebaseData = require('../models/firebase-data').FirebaseData;
const admin = require('firebase-admin');
const serverKey = require('../config/guarani-app-firebase.json');
const logger = require('../utils/logger');

const NOTIFICATION_TYPE = {
    PARTICULAR: 'particular',
    TOPIC: 'topic'
};

admin.initializeApp({
    credential: admin.credential.cert(serverKey)
});

module.exports.checkRegistrationToken = () => {
    return (req, res, next) => {
        let token = req.body.registrationToken;

        admin.auth().verifyIdToken(token)
            .then(payload => {
                return next();
            })
            .catch(error => {
                let data = null;
                if (error.code == 'auth/id-token-revoked') {
                    data = { message: 'El token ha sido revocado. Intentar volver a iniciar sesión.' };
                } else {
                    data = { message: 'El token ingresado en inválido. Vuelva a iniciar sesión.' };
                }
                return routes.doRespond(req, res, Constants.HTTP.UNAUTHORIZED, data);
            });
    }
}

module.exports.updateRegistrationToken = (user_id, firebaseToken, callback) => {
    let query = { user: user_id };
    let update = { user: user_id, token: firebaseToken };

    FirebaseData.findOneAndUpdate(query, update, { upsert: true, new: true }, callback);
}

module.exports.removeUser = (user_id, callback) => {
    FirebaseData.findOneAndRemove({ user: user_id}, callback);
}

module.exports.sendToParticular = (messageTitle, messageBody, recipient) => {
    var message = {
        token: recipient,
        notification: {
            title: messageTitle,
            body: messageBody
        }
    }

    _sendNotification(message, NOTIFICATION_TYPE.PARTICULAR);
}

module.exports.sendToTopic = (messageTitle, messageBody, messageTopic) => {
    var message = {
        topic: messageTopic,
        notification: {
            title: messageTitle,
            body: messageBody
        }
    }

    _sendNotification(message, NOTIFICATION_TYPE.TOPIC);
}

function _sendNotification(message, type) {
    admin.messaging().send(message)
        .then((response) => {
            logger.debug('[firebase][send-message]['+type+'][message-id]: ' + response);
        })
        .catch((error) => {
            logger.error('[firebase][send-message]['+type+'][error] ' + error);
        });
}
