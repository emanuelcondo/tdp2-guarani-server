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
        ref: 'Aula',
        default: null
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
    Examen.count(query, callback);
}

module.exports.findExams = (query, callback) => {
    Examen.find(query)
        .populate({
            path: 'curso',
            select: 'comision docenteACargo',
            populate: [
                { path: 'docenteACargo', select: 'nombre apellido' }
            ]
        })
        .populate('materia', 'codigo nombre')
        .populate('aula')
        .sort({ fecha: 1 })
        .exec(callback);
}