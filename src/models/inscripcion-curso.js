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
        .populate('alumno', '-password -dni')
        .exec(callback);
};

module.exports.deleteInscription = (query, callback) => {
    InscripcionCurso.findOneAndRemove(query, callback);
};

module.exports.createInscription = (inscrption, callback) => {
    InscripcionCurso.create(inscrption, (error, created) => {
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

module.exports.inscriptionCount = (query, callback) => {
    InscripcionCurso.countDocuments(query, callback);
};