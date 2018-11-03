const Periodo = require('../models/periodo').Periodo;
const logger = require('../utils/logger');
const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;
const async = require('async');

module.exports.searchPeriods = (params, callback) => {
    let page = params.page ? parseInt(params.page) : 1;
    let limit = params.limit ? parseInt(params.limit) : 20;

    async.parallel({
        count: (cb) => {
            Periodo.countDocuments({}).exec(cb);
        },
        periodos: (cb) => {
            Periodo.find({})
                    .skip(page - 1)
                    .limit(limit)
                    .sort({ anio: -1, cuatrimestre: -1 })
                    .exec(cb);
        }
    }, (asyncError, result) => {
        let data = null;
        if (result) {
            data = {
                totalcount: result.count,
                totalpages: Math.ceil(result.count / limit),
                page: page,
                perdiodos: result.periodos
            }
        }
        callback(asyncError, data);
    });
}