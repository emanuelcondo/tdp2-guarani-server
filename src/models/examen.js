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
        type: String,
        default: null
    },
    'sede': {
        type: String,
        enum: [ 'CU', 'LH', 'PC' ],
        default: null
    },
    'fecha': {
        type: Date,
        required: true
    }
});

const Examen = mongoose.model('Examen', EXAMEN_SCHEMA, 'examenes');

module.exports.Examen = Examen;

module.exports.createExam = (exam, callback) => {
    Examen.create(exam, callback);
}

module.exports.countExams = (query, callback) => {
    Examen.count(query, callback);
}

module.exports.findExams = (query, callback) => {
    Examen.find(query)
        .where({ fecha: { $gte: new Date() } })
        .populate({
            path: 'curso',
            select: 'comision docenteACargo',
            populate: [
                { path: 'docenteACargo', select: 'nombre apellido' }
            ]
        })
        .populate('materia', 'codigo nombre')
        .sort({ fecha: 1 })
        .exec(callback);
}

module.exports.findOneNoPopulate = (query, callback) => {
    Examen.findOne(query, callback);
}

module.exports.updateOneExam = (query, update, callback) => {
    Examen.findOneAndUpdate(query, update, { new: true })
        .populate({
            path: 'curso',
            select: 'comision docenteACargo',
            populate: [
                { path: 'docenteACargo', select: 'nombre apellido' }
            ]
        })
        .populate('materia', 'codigo nombre')
        .exec(callback);
}

module.exports.removeOneExam = (query, callback) => {
    Examen.findOneAndRemove(query)
        .populate({
            path: 'curso',
            select: 'comision docenteACargo',
            populate: [
                { path: 'docenteACargo', select: 'nombre apellido' }
            ]
        })
        .populate('materia', 'codigo nombre')
        .exec(callback);
}