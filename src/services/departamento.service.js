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