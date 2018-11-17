module.exports.generateReport = (params, callback) => {
    callback(null, {});
}

module.exports.searchPendingSurveysForStudent = (params, callback) => {
    callback(null, { cursos: [] });
}

module.exports.createSurvey = (user_id, course_id, body, callback) => {
    callback(null, { message: "La encuesta ha sido completada con éxito." });
}