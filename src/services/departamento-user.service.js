const DepartamentoUser = require('../models/departamento-user').DepartamentoUser;
const Departamento = require('../models/departamento');
const Materia = require('../models/materia');
const async = require('async');

module.exports.findUserById = (user_id, callback) => {
    DepartamentoUser.findById(user_id, '-password', callback);
}

module.exports.logout = (user_id, callback) => {
    DepartamentoUser.updateOne({ _id: user_id }, { lastLogout: new Date() }, callback);
}

module.exports.searchAssignedDepartaments = (user_id, callback) => {
    let departamentMap = {};

    async.waterfall([
        (wCallback) => {
            DepartamentoUser.findById(user_id)
                .select('departamentos')
                .populate('departamentos')
                .exec(wCallback);
        },
        (user, wCallback) => {
            if (user) {
                let departament_ids = [];
                for (let dep of user.departamentos) {
                    departament_ids.push(dep._id);
                    let _id = dep._id.toString();
                    departamentMap[_id] = {
                        _id: _id,
                        codigo: dep.codigo,
                        nombre: dep.nombre,
                        materias: []
                    }
                }
                let query = { departamento: { $in: departament_ids } };

                Materia.findSubjects(query, wCallback);
            } else {
                wCallback(null, []);
            }
        },
        (asignatures, wCallback) => {
            for (let item of asignatures) {
                let dep_id = item.departamento;
                departamentMap[dep_id.toString()].materias.push(item);
            }

            let departaments = Object.values(departamentMap);
            departaments.sort((a,b) => { return (a.codigo > b.codigo ? 1 : -1); });

            for (let dep of departaments) {
                dep.materias.sort((a,b) => {return (a.codigo > b.codigo ? 1 : -1); });
            }
            wCallback(null, departaments);
        }
    ], callback);
}