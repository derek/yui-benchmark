/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var nopt = require('nopt'),
    path = require('path'),
    Winston = require('winston');

/**
 * Generate a logger utility
 *
 * @public
 * @param {String} The log level
 * @returns A log utility
 */
exports.getLogger = function (loglevel) {
    var logger = new Winston.Logger({
        exitOnError: false,
        colors: {
          info: 'white',
          debug: 'green',
          error: 'red',
          warn: 'yellow',
          verbose: 'cyan'
        },
        levels: {
            verbose: 0,
            debug: 1,
            info: 2,
            data: 3,
            warn: 4,
            error: 6
        },
        transports: [
            new (Winston.transports.Console)({
                colorize: true,
                level: loglevel
            })
        ]
    });

    return logger;
};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 *
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
exports.merge = function (obj1, obj2) {
    var obj3 = {}, attrname;

    for (attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }

    for (attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }

    return obj3;
};

/**
 * Converts an array of arugments into an object containing options
 *
 * @public
 * @param {Array} The options to parse
 * @returns An object containing the parsed options
 */
exports.parseOptions = function (argv) {
    var known = {
            'iterations': Number,
            'loglevel': ['debug', 'info', 'verbose', 'silent'],
            'port': Number,
            'raw': path,
            'ref': [String, Array],
            'repo': path,
            'source': path,
            'timeout': Number,
            'tmp': path,
            'working': Boolean,
            'phantom': Boolean
        },
        shorts = {
            'i': ['--iterations'],
            'silent': ['--loglevel', 'silent'],
            'debug': ['--loglevel', 'debug'],
            'verbose': ['--loglevel', 'verbose'],
            'no-working': ['--working', 'false']
        },
        options = nopt(known, shorts, argv, 0);

    return options;
};

/**
 * Decode HTML entities
 *
 * @public
 * @param {String}
 * @returns
 */
exports.htmlEntitiesDecode = function (str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

/**
 * Encode HTML entities
 *
 * @public
 * @param {String}
 * @returns
 */
exports.htmlEntitiesEncode = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
