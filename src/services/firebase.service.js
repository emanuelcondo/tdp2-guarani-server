var FCM = require('fcm-node')
//Generated private key
var serverKey = require('../config/guarani-app-firebase-adminsdk-s1fqg-b1ba4ac74d.json')
var fcm = new FCM(serverKey)

module.exports.sendToParticular = (messageTitle, messageBody, recipient) => {

  var message = {
      to: recipient,

      notification: {
          title: messageTitle,
          body: messageBody
      }
  }

  fcm.send(message, function(err, response){
      if (err) {
          logger.error("Error al enviar una notificacion a Firebase")
      }
  })

}

module.exports.sendToTopic = (messageTitle, messageBody, messageTopic) => {

  var message = {
      topic: messageTopic,

      notification: {
          title: messageTitle,
          body: messageBody
      }
  }

  fcm.send(message, function(err, response){
      if (err) {
          logger.error("Error al enviar una notificacion a Firebase")
      }
  })

}
