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
    'timestamp' : {
        type: Date,
        default: Date.now
    }
});

const InscripcionCurso = mongoose.model('InscripcionCurso', INSCRIPCION_CURSO_SCHEMA);

module.exports.InscripcionCurso = InscripcionCurso;

module.exports.findRegisters = (query, callback) => {
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

module.exports.findRegistersWithUser = (query, callback) => {
    InscripcionCurso.find(query)
        .populate('alumno', '-password -dni')
        .exec(callback);
}

module.exports.deleteRegister = (query, callback) => {
    //TODO: Cupo +1 si no era condicional
    //TODO: Devolver como pide la API
    InscripcionCurso.deleteOne(query, callback);
}
