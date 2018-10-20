const admin = require('firebase-admin');
const serverKey = require('../config/guarani-app-firebase-adminsdk-s1fqg-b1ba4ac74d.json');
const logger = require('../utils/logger');

const NOTIFICATION_TYPE = {
    PARTICULAR: 'particular',
    TOPIC: 'topic'
};

admin.initializeApp({
    credential: admin.credential.cert(serverKey)
});

module.exports.sendToParticular = (messageTitle, messageBody, recipient) => {
    var message = {
        to: recipient,
        data: {
            title: messageTitle,
            body: messageBody
        }
    }

    _sendNotification(message, NOTIFICATION_TYPE.PARTICULAR);
}

module.exports.sendToTopic = (messageTitle, messageBody, messageTopic) => {
    var message = {
        topic: messageTopic,
        data: {
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
