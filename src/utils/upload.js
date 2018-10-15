const multer = require('multer');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 mb
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (!file.originalname.toLocaleLowerCase().match(/\.csv$/)) {
            return cb(new Error('INVALID_MIME_TYPE'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: MAX_FILE_SIZE
    }
}).single('file');

module.exports.checkFile = () => {
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                let msg = '';
                let statusCode = 422;
                if (err.message == 'INVALID_MIME_TYPE') msg = 'Solamente archivos CSV son permitidos.';
                else if (err.code == 'LIMIT_FILE_SIZE') msg = 'El archivo que intenta procesar es demasiado grande. Tamaño máximo: '+MAX_FILE_SIZE/(1024*1024)+' mb';
                else {
                    statusCode = 500;
                    msg = 'Un error inesperado a ocurrido.';
                }
                return res.status(statusCode).json({ status: 'error', data: { message: msg } });
            } if (!req.file) {
                return res.status(422).json({ status: 'error', data: { message: 'Un archivo csv es requerido para realizar la importación de datos.' } });
            } else {
                return next();
            }
        });
    }
}