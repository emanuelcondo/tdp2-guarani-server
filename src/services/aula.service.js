const Aula = require('../models/aula').Aula;

module.exports.import = (rows, callback) => {
    let batch = Aula.collection.initializeUnorderedBulkOp();

    for (let row of rows) {
        let classroom = {
            sede: row['Sede'],
            aula: row['Aula'],
            capacidad: parseInt(row['Capacidad'])
        }
        batch.find({ sede: classroom.sede, aula: classroom.aula }).upsert().updateOne({ $set: classroom });
    }

    batch.execute(callback);
}