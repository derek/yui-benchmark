/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */

var nopt = require('nopt'),
    path = require('path'),
    little = require('little-logger'),
    packageName = require('../package').name;

/**
 * Generate a logger utility
 *
 * @public
 * @param {String} The log level
 * @returns A log utility
 */
exports.getLogger = function (loglevel) {
    loglevel = loglevel || 'info';
    return new (little.Logger)(loglevel, {format: '\033[31m' + packageName + '\033[37m [%l] %a'});
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
        'multiseed': Boolean,
        'port': Number,
        'timeout': Number,
        'iterations': Number,
        'yuipath': path,
        'source': path,
        'tmproot': path
    },
    shorts = {},
    options = nopt(known, shorts, argv, 0);

    return options;
};

exports.getProcessList = function (callback) {
    var exec = require('child_process').exec,
        pattern = /^(\d+)\s+([^\s]+)\s+([^\s]+)\s+(.+)/,
        cmd = 'ps -ax';

    exec(cmd, function(err, stdout, stderr){
        var processes = [],
            lines = stdout.split('\n');

        lines.forEach(function(line){
            line.replace(pattern, function(_, id, tty, time, cmd){
                processes.push({
                    id: id,
                    tty: tty,
                    time: time,
                    cmd: cmd
                });
            });
        });

        callback(err, processes);
    });
};
