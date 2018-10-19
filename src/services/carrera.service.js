const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const Carrera = require('../models/carrera').Carrera;

module.exports.carrerRestricted = () => {
    return (req, res, next) => {
        let carrer_id = req.params.carrera;
        let user = req.context.user;
        let carrers = user.carreras ? user.carreras : [];
        let my_carrers_ids = carrers.map((item) => { return item._id.toString(); });

        if (my_carrers_ids.indexOf(carrer_id) > -1) {
            return next();
        } else {
            return routes.doRespond(req, res, HTTP.FORBIDDEN, { message: 'Carrera con id \''+carrer_id+'\' no registrada dentro de las carreras inscriptas.' });
        }
    }
}

module.exports.import = (rows, callback) => {
    let batch = Carrera.collection.initializeUnorderedBulkOp();

    for (let row of rows) {
        let carrer = {
            codigo: parseInt(row['Identificador']),
            nombre: row['Nombre']
        }
        if (row['isNew']) carrer['materias'] = [];
        batch.find({ codigo: carrer.codigo}).upsert().updateOne({ $set: carrer });
    }

    batch.execute(callback);
}