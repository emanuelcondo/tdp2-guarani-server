const mongoose = require('mongoose');

const EXAMEN_SCHEMA = mongoose.Schema({
    'curso': {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Curso'
    },
    'materia' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Materia'
    },
    'aula': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aula'
    },
    'fecha': {
        type: Date,
        required: true
    }
});

const Examen = mongoose.model('Examen', EXAMEN_SCHEMA);

module.exports.Examen = Examen;

module.exports.createExam = (exam, callback) => {
    Examen.create(exam, callback);
}

module.exports.countExams = (query, callback) => {
//    Examen.countDocuments(query, callback);
    Examen.count(query, callback);
}