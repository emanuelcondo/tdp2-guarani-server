const routes = require('../routes/routes');
const Constants = require('../utils/constants');
const logger = require('../utils/logger');
const Departamento = require('../models/departamento').Departamento;

module.exports.import = (rows, callback) => {
    let batch = Departamento.collection.initializeUnorderedBulkOp();

    for (let row of rows) {
        let departament = {
            codigo: parseInt(row['Identificador']),
            nombre: row['Nombre']
        }
        batch.find({ codigo: departament.codigo}).upsert().updateOne({ $set: departament });
    }

    batch.execute(callback);
}

module.exports.loadDepartamentInfo = (source) => {
    return (req, res, next) => {
        let departament_code = req[source].departamento;
        Departamento.findOne({ codigo: departament_code }, (error, found) => {
            if (error) {
                logger.error('[departamento][find-one] '+error);
                return routes.doRespond(req, res, Constants.HTTP.INTERNAL_SERVER_ERROR, { message: 'Un error inesperado ha ocurrido.' });
            } else if (!found) {
                return routes.doRespond(req, res, Constants.HTTP.NOT_FOUND, { message: 'El departamento con código '+departament_code+ ' no fue encontrado.' });
            } else {
                req.context = req.context ? req.context : {};
                req.context.departament = found;
                return next();
            }
        });
    }
}