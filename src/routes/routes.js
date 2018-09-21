const Constants = require('../utils/constants');
const Utils = require('../utils/utils');

module.exports = function (router) {
    require('./usuario.route')(router);
    require('./materia.route')(router);
    require('./curso.route')(router);
}

module.exports.doRespond = function (req, res, code, data) {
    return _sendResponse(req, res, code, data);
}

module.exports.validateInput = _validateInput;

module.exports.deepInputValidation = _deepInputValidation;


// PRIVATE METHODS

function _sendResponse(req, res, code, data) {
    var resData = {
        'data': null
    };

    if (code >= 200 && code <= 399) {
        resData.data = data;
        resData.status = "success";
    } else {
        resData.status = "error";
        resData.error = data;
    }
    return res.status(code).json(resData);
};


function _validateInput(key, type, source, isMandatory, options) {
    return function (req, res, next) {
        type = type.toLowerCase();
        source = source.toLowerCase();

        // check key value
        if (!(typeof key === 'string' || key instanceof String)) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 1, "Invalid input key."));
        }

        // check validation type
        if (Constants.VALIDATION_TYPES.hasOwnProperty(type)) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 2, "Invalid input type."));
        }

        // check source type
        if (Constants.VALIDATION_SOURCES.hasOwnProperty(source)) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 3, "Invalid input source."));
        }

        // check mandatory and set default value
        if (isMandatory !== undefined && isMandatory !== Constants.VALIDATION_MANDATORY && isMandatory !== Constants.VALIDATION_OPTIONAL) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 4, "Invalid input mandatory."));
        }

        // check that the value has been given
        if (req[source].hasOwnProperty(key)) { //if given

            // then validate value
            if ((type === Constants.VALIDATION_TYPES.TaggeableInput && !TaggeableInput.check(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.JSON && !Utils.isJson(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.Array && !Utils.isArray(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.String && req[source][key].trim().length == 0) ||
                (type === Constants.VALIDATION_TYPES.Boolean && !Utils.isBoolean(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.Date && !Utils.isDate(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.Int && !Utils.isInt(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.Number && !Utils.isNumber(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.Email && !Utils.isEmail(req[source][key])) ||
                (type === Constants.VALIDATION_TYPES.ObjectId && !Utils.isObjectId(req[source][key]))) {

                //if not valid, return error
                return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 5, "Input '" + key + "' has an invalid value."));

            } else {
                return next();
            }

        } else if (isMandatory === Constants.VALIDATION_MANDATORY) { //if not given and it was mandatory, then return error
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 6, "Input '" + type + "': '" + key + "' is mandatory."));
        }
    };
};

 // this is used to validate inputs in an array
 const ARRAY_KEY = '$';

 var _validateValue = function (key, value, type) {
     if ((type === Constants.VALIDATION_TYPES.JSONO && !Utils.isJson(value)) ||
         (type === Constants.VALIDATION_TYPES.Array && !Utils.isArray(value)) ||
         (type === Constants.VALIDATION_TYPES.String && (!Utils.isString(value) || value.trim().length == 0)) ||
         (type === Constants.VALIDATION_TYPES.Boolean && !Utils.isBoolean(value)) ||
         (type === Constants.VALIDATION_TYPES.Date && !Utils.isDate(value)) ||
         (type === Constants.VALIDATION_TYPES.Int && !Utils.isInt(value)) ||
         (type === Constants.VALIDATION_TYPES.Number && !Utils.isNumber(value)) ||
         (type === Constants.VALIDATION_TYPES.Email && !Utils.isEmail(value)) ||
         (type === Constants.VALIDATION_TYPES.ObjectId && !Utils.isObjectId(value))) {
 
         //if not valid, return error
         return Utils.generateError('VALIDATE_INPUT', 5, "Input '" + type + "': '" + key + "' has an invalid value.");
 
     } else {
         return { message: 'success' };
     }
 }
 
 var _recursiveInputValidation = function (keys, type, source, isMandatory) {
 
     keys = keys.map(function (key) { return key.trim(); });
 
     var key = keys[0];
     var remaining_keys = keys.slice(1);
 
     // check that the value has been given
     if (source.hasOwnProperty(key)) {
 
         if (remaining_keys.length) {
             var status = _recursiveInputValidation(remaining_keys, type, source[key], isMandatory);
             return status;
         } else {
             return _validateValue(key, source[key], type);
         }
 
     // check that the value has been given inside of an array
     } else if (key == ARRAY_KEY) {
 
         if (Array.isArray(source)) {
 
             for (var i = 0; i < source.length; i++) {
                 var status;
                 if (remaining_keys.length) {
                     status = _recursiveInputValidation(remaining_keys, type, source[i], isMandatory);
                 } else {
                     status = _validateValue(key, source[i], type);
                 }
 
                 if (status && status.code) {
                     return status;
                 }
 
             }
 
             return { message: 'success' };
 
         } else if (remaining_keys.length || (remaining_keys.length == 0 && isMandatory)) {
             var message = (remaining_keys.length) ? ("Input '" + type + "': '" + key + "' not found.") : ("Field '" + key + "' is mandatory.");
             return Utils.generateError('VALIDATE_INPUT', 4, message);
         } else {
             return Utils.generateError('VALIDATE_INPUT', 4, "Input 'array': '" + key + "' has an invalid datatype.");
         }
 
     // iterates the remaining keys
     } else if (remaining_keys.length || (remaining_keys.length == 0 && isMandatory)) {
         var message = (remaining_keys.length) ? ("Input '" + type + "': '" + key + "' not found.") : ("Field '" + key + "' is mandatory.");
         return Utils.generateError('VALIDATE_INPUT', 4, message);
     } else {
         return { message: 'success' }
     }
 
 }
 
 var _deepInputValidation = function (key, type, source, isMandatory) {
     return function (req, res, next) {
         type = type.toLowerCase();
         source = source.toLowerCase();
 
         // check key value
         if (!(typeof key === 'string' || key instanceof String)) {
             return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 1, "Invalid input key."));
         }
 
         // check validation type
         if (Constants.VALIDATION_TYPES.hasOwnProperty(type)) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 2, "Invalid input type."));
         }
 
         // check source type
         if (Constants.VALIDATION_SOURCES.hasOwnProperty(source)) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 3, "Invalid input source."));
         }
 
         // check mandatory and set default value
         if (isMandatory !== undefined && isMandatory !== Constants.VALIDATION_MANDATORY && isMandatory !== Constants.VALIDATION_OPTIONAL) {
            return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, Utils.generateError('VALIDATE_INPUT', 4, "Invalid input mandatory."));
         }
 
         var status = _recursiveInputValidation(key.split('.'), type, req[source], isMandatory == Constants.VALIDATION_MANDATORY);
 
         if (status && status.code) {
             var error = status;
             return _sendResponse(req, res, Constants.HTTP.UNPROCESSABLE_ENTITY, error);
         } else {
             return next();
         }
     }
 
 }