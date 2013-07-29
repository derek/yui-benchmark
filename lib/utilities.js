/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var nopt = require('nopt'),
    path = require('path'),
    winston = require('winston'),
    packageName = require('../package').name;
    console.log(String.prototype.underline);

/**
 * Generate a logger utility
 *
 * @public
 * @param {String} The log level
 * @returns A log utility
 */
exports.getLogger = function (loglevel) {
    var logger = new (winston.Logger)({
        exitOnError: false,
        colors: {
          info: 'white',
          debug: 'green',
          error: 'red'
        },
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: loglevel
            })
        ]
    });

    return logger;
};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
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

exports.parseOptions = function (argv) {
    var known = {
        'ref': Array,
        'wip': Boolean,
        'raw': Boolean,
        'pretty': Boolean,
        'port': Number,
        'timeout': Number,
        'iterations': Number,
        'yuipath': path,
        'source': path,
        'tmproot': path,
        'out': path
    },
    shorts = {},
    options = nopt(known, shorts, argv, 0);

    return options;
};

exports.htmlEntitiesDecode = function (str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

exports.htmlEntitiesEncode = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
