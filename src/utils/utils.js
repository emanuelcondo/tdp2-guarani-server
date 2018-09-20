const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const validator = require('validator');

var isEmail = function (email) {
    return validator.isEmail(email);
};

var validateDate = function (dateString, format) {
    var formats = [
        moment.ISO_8601
    ];

    if (format != undefined)
        formats.push(format);

    return moment(dateString, formats, true).isValid();
};

var isInt = function (a) {
    return !isNaN(a) && parseInt(a) == parseFloat(a);
};

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var isBoolean = function (b) {
    return (b === 'true' || b === 'false' || typeof b === 'boolean');
};

var isDate = function (d) {
    return !isNaN(Date.parse(d));
}

var isString = function (param) {
    return (typeof param == 'string');
}

var isObjectId = function (param) {
    return ObjectId.isValid(param);
}

var isJson = function (obj) {
    return (obj && typeof obj == "object");
}

var isArray = function (obj) {
    try {
        return (obj instanceof Array);
    } catch (e) {
        return false;
    }
}

var convertToString = function (param) {
    if (param != undefined || param) {
        if (param && typeof param == "object")
            return JSON.stringify(param);
        return param.toString();
    } else {
        return '';
    }
}

var generateError = function (errorCode, errorId, message) {
    return {
        'id': errorId,
        'code': errorCode,
        'message': message
    };
};

var replaceSpecialCharacters = function (str) {

    str = str.replace(/[&\/\\#,+()$~%'":*?<>{}!]/g, '_');

    str = str.replace(/[\u0020]/g, '-');

    str = str.replace(/ñ/g, 'n');
    str = str.replace(/Ñ/g, 'N');

    str = str.replace(/ñ/g, 'n');
    str = str.replace(/Ñ/g, 'N');

    str = str.replace(/ç/g, 'c');
    str = str.replace(/Ç/g, 'C');

    str = str.replace(/á/g, 'a');
    str = str.replace(/Á/g, 'A');
    str = str.replace(/ä/g, 'a');
    str = str.replace(/Ä/g, 'A');

    str = str.replace(/é/g, 'e');
    str = str.replace(/É/g, 'E');
    str = str.replace(/ë/g, 'e');
    str = str.replace(/Ë/g, 'E');

    str = str.replace(/í/g, 'i');
    str = str.replace(/Í/g, 'I');
    str = str.replace(/ï/g, 'i');
    str = str.replace(/Ï/g, 'I');

    str = str.replace(/ó/g, 'o');
    str = str.replace(/Ó/g, 'O');
    str = str.replace(/ö/g, 'o');
    str = str.replace(/Ö/g, 'O');
    
    str = str.replace(/ú/g, 'u');
    str = str.replace(/Ú/g, 'U');
    str = str.replace(/ü/g, 'u');
    str = str.replace(/Ü/g, 'U');

    return str;
}

module.exports.isBoolean = isBoolean;
module.exports.isDate = isDate;
module.exports.isString = isString;
module.exports.isObjectId = isObjectId;
module.exports.isJson = isJson;
module.exports.isArray = isArray;
module.exports.isEmail = isEmail;
module.exports.validateDate = validateDate;
module.exports.isInt = isInt;
module.exports.isNumber = isNumber;

module.exports.replaceSpecialCharacters = replaceSpecialCharacters;
module.exports.generateError = generateError;
module.exports.convertToString = convertToString;