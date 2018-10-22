const mongoose = require('mongoose');

const INSCRIPCION_EXAMEN_SCHEMA = mongoose.Schema({
    'examen' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Examen'
    },
    'alumno' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Alumno'
    },
    'condicion': {
        type: String,
        required: true,
        enum: [ "Regular", "Libre" ]
    },
    'timestamp' : {
        type: Date,
        default: Date.now
    }
});

const InscripcionExamen = mongoose.model('InscripcionExamen', INSCRIPCION_EXAMEN_SCHEMA, 'inscripcionexamenes');

module.exports.InscripcionExamen = InscripcionExamen;

module.exports.findExamInscriptions = (query, callback) => {
    InscripcionExamen.find(query)
        .populate({
            path: 'examen',
            select: 'curso materia fecha',
            populate: [
                { 
                    path: 'curso', 
                    select: 'comision docenteACargo',
                    populate: [
                        { path: 'docenteACargo', select: 'nombre apellido' }
                    ]
                },
                { 
                    path: 'materia', 
                    select: 'codigo nombre' 
                }
            ]
        })
        .exec(callback);
}

module.exports.findNoPopulate = (query, callback) => {
    InscripcionExamen.find(query, callback);
}

module.exports.findOneExamInscription = (query, callback) => {
    InscripcionExamen.findOne(query)
        .populate({
            path: 'examen',
            select: 'curso materia fecha',
            populate: [
                { 
                    path: 'curso', 
                    select: 'comision docenteACargo',
                    populate: [
                        { path: 'docenteACargo', select: 'nombre apellido' }
                    ]
                },
                { 
                    path: 'materia', 
                    select: 'codigo nombre' 
                }
            ]
        })
        .exec(callback);
};

module.exports.findOneNoPopulate = (query, callback) => {
    InscripcionExamen.findOne(query, callback);
}

module.exports.findExamInscriptionsWithUser = (query, callback) => {
    InscripcionExamen.find(query)
        .populate({
            path: 'alumno',
            select: 'legajo nombre apellido carreras prioridad',
            populate: [
                { path: 'carreras', select: 'codigo nombre' }
            ]
        })
        .exec(callback);
};

module.exports.deleteExamInscription = (query, callback) => {
    InscripcionExamen.findOneAndRemove(query, callback);
};

module.exports.createExamInscription = (examInscription, callback) => {
    InscripcionExamen.create(examInscription, (error, created) => {
        if (error) {
            callback(error);
        } else {
            InscripcionExamen.populate(created, 'examen', callback);
        }
    });
}

module.exports.updateExamInscriptions = (query, data, callback) => {
    InscripcionExamen.update(query, data, callback);
};

module.exports.examInscriptionCount = (query, callback) => {
    InscripcionExamen.countDocuments(query, callback);
};

module.exports.deleteAllExamInscription = (query, callback) => {
    InscripcionExamen.find(query).remove(callback);
};