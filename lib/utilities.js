/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var nopt = require('nopt'),
    path = require('path'),
    Winston = require('winston'),
    os = require("os"),
    esprima = require('esprima');

/**
 * Generate a logger utility
 *
 * @public
 * @param {String} The log level
 * @return {Object} A log utility
 */
exports.getLogger = function (loglevel) {
    var logger = new Winston.Logger({
        exitOnError: true,
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
 * @return {Object} obj3 a new object based on obj1 and obj2
 */
exports.merge = function (obj1, obj2) {
    var obj3 = {}, attrname;

    for (attrname in obj1) {
        if (obj1.hasOwnProperty(attrname)) {
            obj3[attrname] = obj1[attrname];
        }
    }

    for (attrname in obj2) {
        if (obj2.hasOwnProperty(attrname)) {
            obj3[attrname] = obj2[attrname];
        }
    }

    return obj3;
};

/**
 * Converts an array of arugments into an object containing options
 *
 * @public
 * @param {Array} The options to parse
 * @return {Object} An object containing the parsed options
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
 * @return {Boolean}
 */
exports.htmlEntitiesDecode = function (str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
};

/**
 * Encode HTML entities
 *
 * @public
 * @param {String}
 * @return {Boolean}
 */
exports.htmlEntitiesEncode = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/**
 * Obtains the local IP address.  Borrowed from yeti/lib/local-ip.js.
 *
 * @public
 * @param {String}
 * @return {Boolean}
 */
exports.getLocalIP = (function () {
    var cachedIP;

    function queryLocalIP() {
        var name,
            localIP,
            interfaces = os.networkInterfaces(),
            interfaceNames = Object.keys(interfaces);

        function internalOnly(address) {
            return !address.internal;
        }

        function tryAddresses(address) {
            // Prefer IPv4 addresses.
            if (!localIP || address.family === "IPv4") {
                localIP = address.address;
            }
        }

        do {
            name = interfaceNames.pop();

            // Skip Back to My Mac or VPNs.
            if (name.indexOf("utun") === 0) {
                continue;
            }

            interfaces[name]
                .filter(internalOnly)
                .forEach(tryAddresses);
        } while (interfaceNames.length && !localIP);

        if (!localIP) {
            localIP = "localhost";
        }

        return localIP;
    }

    return function getLocalIP() {
        if (!cachedIP) {
            cachedIP = queryLocalIP();
        }
        return cachedIP;
    };
}());

/**
 * Converts the source code of suite to an object
 *
 * @public
 * @param {String}
 * @return {Object}
 */
exports.parseSuiteSource = function (src) {
    var fs = require('fs'),
        vm = require('vm'),
        context = {suite: null},
        perfSuitePath = path.join(__dirname, 'assets/perf-suite.js'),
        perfSuite = fs.readFileSync(perfSuitePath);

    // Turn the config string into an object
    vm.runInNewContext(perfSuite + src, context);
    return context.suite.exportConfig();
};

/**
 * Validates a test suite source file.
 *
 * Currently this involves doing two checks:
 *   1) A test file must export a 'suite' variable.
 *   2) A test file cannot include any require() statements.
 *
 * This isn't meant for bullet-proof security at the moment, but rather
 * it's just some simple checks to ensure people aren't doing evil things
 * in addition to the test suite being valid.
 *
 * @public
 * @param {String}
 * @return {Boolean}
 */
exports.validateSuite = function (src) {
    var exportsSuite = false,
        hasRequire = false,
        tokens, key;

    tokens = esprima.parse(src, { tokens: true }).tokens;

    for (key in tokens) {
        if (tokens.hasOwnProperty(key)) {
            if (tokens[key].value === 'suite') {
                exportsSuite = true;
            }
            if (tokens[key].value === 'require') {
                hasRequire = true;
            }
        }
    }

    return (exportsSuite === true && hasRequire === false);
};
