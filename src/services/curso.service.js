const Curso = require('../models/curso').Curso;
const ObjectId = require('mongoose').mongo.ObjectId;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.retrieveCoursesBySubject = (subject_id, callback) => {
    let query = { materia: ObjectId(subject_id) };

    Curso.find(query)
        .populate('sede')
        .populate('docenteACargo', 'nombre apellido')
        .populate('jtp', 'nombre apellido')
        .populate('ayudantes', 'nombre apellido')
        .exec(callback);
};