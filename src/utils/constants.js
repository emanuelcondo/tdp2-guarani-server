module.exports = {
    'VALIDATION_TYPES': {
        'ObjectId': 'objectid',
        'TaggeableInput': 'taggeableinput',
        'JSON': 'json',
        'String': 'string',
        'Boolean': 'boolean',
        'Int': 'int',
        'Email': 'email',
        'Number': 'number',
        'Date': 'date',
        'Array': 'array'
    },
    'VALIDATION_SOURCES': {
        'Headers': 'headers',
        'Body': 'body',
        'Params': 'params',
        'Query': 'query'
    },
    'VALIDATION_MANDATORY': 'mandatory',
    'VALIDATION_OPTIONAL': 'optional',
    'HTTP': {
        'SUCCESS': 200,
        'BAD_REQUEST': 400,
        'UNAUTHORIZED': 401,
        'FORBIDDEN': 403,
        'NOT_FOUND': 404,
        'UNPROCESSABLE_ENTITY': 422,
        'INTERNAL_SERVER_ERROR': 500
    }
}