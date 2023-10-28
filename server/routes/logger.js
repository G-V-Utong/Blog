const { createLogger, transports, format } = require('winston');

// Logging functions

const userLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'user.log',
            level: 'info',
            format: format.combine(format.timestamp(),format.json())
        }),
        new transports.File({
            filename: 'user-error.log',
            level: 'error',
            format: format.combine(format.timestamp(),format.json())
        })
    ]
});

const postLogger = createLogger({
    transports: [
        new transports.File({
            filename: 'post.log',
            level: 'info',
            format: format.combine(format.timestamp(),format.json())
        }),
        new transports.File({
            filename: 'post-error.log',
            level: 'error',
            format: format.combine(format.timestamp(),format.json())
        })
    ]
});

module.exports = {userLogger, postLogger};