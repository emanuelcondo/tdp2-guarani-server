const mongoose = require('mongoose');

const INSCRIPCION_CURSO_SCHEMA = mongoose.Schema({
    'curso' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso'
    },
    'materia' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Materia'
    },
    'alumno' : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Alumno'
    },
    'condicion': {
        type: String,
        required: true,
        enum: [ "Regular", "Condicional" ] // usar Regular con curso, y Condicional con materia
    },
    'exCondicional': {
        type: Boolean
    },
    'timestamp' : {
        type: Date,
        default: Date.now
    },
    'anio': {
        type: Number,
        required: true
    },
    'cuatrimestre': {
        type: Number,
        required: true
    },
    'notaCursada': {
        type: Number,
        min: 0,
        max: 10,
    },
    'encuestaCompleta': {
        type: Boolean,
        default: false
    }
});

const InscripcionCurso = mongoose.model('InscripcionCurso', INSCRIPCION_CURSO_SCHEMA);

module.exports.InscripcionCurso = InscripcionCurso;

module.exports.findInscriptions = (query, callback) => {
    InscripcionCurso.find(query)
        .populate('materia')
        .populate({
            path: 'curso',
            populate: [
                { path: 'sede' },
                { path: 'docenteACargo', select: 'nombre apellido' },
                { path: 'jtp', select: 'nombre apellido' },
                { path: 'ayudantes', select: 'nombre apellido' }
            ]
        })
        .exec(callback);
}

module.exports.findNoPopulate = (query, callback) => {
    InscripcionCurso.find(query, callback);
}

module.exports.findOneInscription = (query, callback) => {
    InscripcionCurso.findOne(query)
        .populate('materia')
        .populate({
            path: 'curso',
            populate: [
                { path: 'sede' },
                { path: 'docenteACargo', select: 'nombre apellido' },
                { path: 'jtp', select: 'nombre apellido' },
                { path: 'ayudantes', select: 'nombre apellido' }
            ]
        })
        .exec(callback);
};

module.exports.findOneNoPopulate = (query, callback) => {
    InscripcionCurso.findOne(query, callback);
}

module.exports.findInscriptionsWithUser = (query, callback) => {
    InscripcionCurso.find(query)
        .populate({
            path: 'alumno',
            select: 'legajo nombre apellido carreras prioridad',
            populate: [
                { path: 'carreras', select: 'codigo nombre' }
            ]
        })
        .exec(callback);
};

module.exports.deleteInscription = (query, callback) => {
    InscripcionCurso.findOneAndRemove(query, callback);
};

module.exports.createInscription = (inscription, callback) => {
    InscripcionCurso.create(inscription, (error, created) => {
        if (error) {
            callback(error);
        } else {
            InscripcionCurso.populate(created, 'curso materia', callback);
        }
    });
}

module.exports.updateInscriptions = (query, data, callback) => {
    InscripcionCurso.update(query, data, callback);
};

module.exports.updateOneInscription = (query, data, callback) => {
    InscripcionCurso.findOneAndUpdate(query, data, callback);
}

module.exports.inscriptionCount = (query, callback) => {
    InscripcionCurso.countDocuments(query, callback);
};