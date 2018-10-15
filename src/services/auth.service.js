const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const AlumnoService = require('./alumno.service');
const DocenteService = require('./docente.service');
const AdminService = require('./admin.service');
const AutogestionService = require('./autogestion.service');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const logger = require('../utils/logger');

const TTL_MINUTES = 40;

const jwtOptions = {
    secret: 'eyJ|hbGciOiJ=@IUzI1N_iIsInR5cC=+_I6IkpXVCJ9==',
    expiresIn: TTL_MINUTES * 60 // 2400 seconds == 40 minutes
}

const ROLES = {
    ALUMNO: {
        sufficiency: 1,
        name: "alumno"
    },
    DOCENTE: {
        sufficiency: 2,
        name: "docente"
    },
    ADMIN: {
        sufficiency: 3,
        name: "admin"
    }
}

const AUTOGESTION = 'autogestion';

module.exports.ALUMNO = ROLES.ALUMNO.name;
module.exports.DOCENTE = ROLES.DOCENTE.name;
module.exports.ADMIN = ROLES.ADMIN.name;

module.exports.AUTOGESTION = AUTOGESTION;

module.exports.authenticateUser = (role) => {
    return (req, res, next) => {
        let usuario = req.body.usuario;
        let password = req.body.password;

        let AuthenticationService = null;
        switch (role) {
            case ROLES.ALUMNO.name:
                AuthenticationService = AlumnoService;
                break;
            case ROLES.DOCENTE.name:
                AuthenticationService = DocenteService;
                break;
            case ROLES.ADMIN.name:
                AuthenticationService = AdminService;
                break;
            case AUTOGESTION:
                AuthenticationService = AutogestionService;
                break;
            default:
                break;
        }

        if (AuthenticationService) {
            AuthenticationService.authenticateUser(usuario, password, (error, user) => {
                if (error) {
                    let log = "[authenticate user] ["+role+"] " + error;
                    logger.error(log);
                    return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else if (!user) {
                    return routes.doRespond(req, res, HTTP.UNAUTHORIZED, { message: 'Usuario y/o password inválido.' });
                } else {
                    req.context = req.context ? req.context : {};
                    req.context.user = user;
                    return next();
                }
            });
        } else {
            return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
        }
    }
};

module.exports.generateSessionToken = (user, role, callback) => {
    const payload = {
        user: user._id,
        role: role,
        timestamp: user.lastLogin.getTime()
    }
    const token = jwt.sign(payload, jwtOptions.secret, { expiresIn: jwtOptions.expiresIn});
    var result = {
        token: token,
        rol: role,
        expiracionToken: moment(new Date()).add(TTL_MINUTES, 'm').toDate()
    }

    callback(null, result);
};

module.exports.tokenRestricted = () => {
    return (req, res, next) => {
        let token = req.headers.token;

        jwt.verify(token, jwtOptions.secret, (error, decoded) => {
            if (error) {
                let message = "Token Inválido";
                if (error.name == "TokenExpiredError") message = "Token Expirado"
                return routes.doRespond(req, res, HTTP.UNAUTHORIZED, { message: message });
            } else {
                _findUser(decoded.user, decoded.role, (error, user) => {
                    if (error) {
                        logger.error('[token restricted][find user] ' + error);
                        return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR,  { message: 'Un error inesperado ha ocurrido' });
                    } else if (!user) {
                        return routes.doRespond(req, res, HTTP.UNAUTHORIZED,  { message: 'Usuario no autorizado' });
                    } else {
                        let timestamp = decoded.timestamp;
                        let lastLogin = user.lastLogin;
                        let lastLogout = user.lastLogout;

                        if (lastLogin && lastLogin.getTime() == timestamp && (!lastLogout || lastLogin > lastLogout)) {
                            req.context = req.context ? req.context : {};
                            user.role = decoded.role;
                            req.context.user = user;
                            return next();
                        } else {
                            return routes.doRespond(req, res, HTTP.UNAUTHORIZED, { message: "Token inválido." });
                        }
                    }
                });
            }
        });
    };
};

module.exports.roleRestricted = (roleRequired) => {
    return (req, res, next) => {
        let user = req.context && req.context.user ? req.context.user : null;
        if (user && _sufficiencyOfRole(user.role) >= _sufficiencyOfRole(roleRequired)) {
            return next();
        } else if (user) {
            return routes.doRespond(req, res, HTTP.FORBIDDEN, { message: "Rol insuficiente." });
        } else {
            return routes.doRespond(req, res, HTTP.UNAUTHORIZED, { message: "Usuario no autorizado." });
        }
    }
};

module.exports.logout = () => {
    return (req, res, next) => {
        let user = req.context.user;

        let AuthenticationService = null;
        switch (user.role) {
            case ROLES.ALUMNO.name:
                AuthenticationService = AlumnoService;
                break;
            case ROLES.DOCENTE.name:
                AuthenticationService = DocenteService;
                break;
            case ROLES.ADMIN.name:
                AuthenticationService = AdminService;
                break;
            default:
                break;
        }

        if (AuthenticationService) {
            AuthenticationService.logout(user._id, (error) => {
                if (error) {
                    let log = "[logout] ["+user.role+"] " + error;
                    logger.error(log);
                    return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
                } else {
                    return next();
                }
            });
        } else {
            return routes.doRespond(req, res, HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
        }
    }
};

// PRIVATE METHODS

function _findUser(user_id, role, callback) {
    let AuthenticationService = null;
    switch (role) {
        case ROLES.ALUMNO.name:
            AuthenticationService = AlumnoService;
            break;
        case ROLES.DOCENTE.name:
            AuthenticationService = DocenteService;
            break;
        case ROLES.ADMIN.name:
            AuthenticationService = AdminService;
            break;
        default:
            break;
    }

    if (AuthenticationService) {
        AuthenticationService.findUserById(user_id, callback);
    } else {
        callback();
    }
}

function _sufficiencyOfRole(role) {
    let key = role ? role.toUpperCase() : '';
    if (key && ROLES[key]) {
        return ROLES[key].sufficiency;
    } else {
        return -1;
    }
}