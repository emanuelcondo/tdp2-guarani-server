const routes = require('../routes/routes');
const HTTP = require('../utils/constants').HTTP;

module.exports.carrerRestricted = () => {
    return (req, res, next) => {
        let carrer_id = req.params.carrera;
        let user = req.context.user;
        let my_carrers_ids = user.carreras.map((item) => { return item._id.toString(); });

        if (my_carrers_ids.indexOf(carrer_id) > -1) {
            return next();
        } else {
            return routes.doRespond(req, res, HTTP.FORBIDDEN, { message: 'Carrera con id \''+carrer_id+'\' no registrada dentro de las carreras inscriptas.' });
        }
    }
}