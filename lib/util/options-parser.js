
/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var nopt = require('nopt'),
    path = require('path'),
    known = {
        'ref': Array,
        'refs': Boolean,
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
    shorts = {};

var raw = function (args) {
    var parsed = nopt(known, shorts, args, 0);
    return parsed;
};

var has = function (a) {
    var cooked = raw().argv.cooked,
        ret = false;

    cooked.forEach(function (o) {
        if ((o === '--' + a) || (o === '--no-' + a)) {
            ret = true;
        }
    });

    return ret;
};

var clean = function (args) {
    var parsed = raw(args);
    delete parsed.argv;
    return parsed;
};


var setDefault = function (value, theDefault) {
    if (value === undefined) {
        return theDefault;
    }
    else {
        return value;
    }
};

var parse = function (args) {
    var parsed = clean(args);

    if (parsed.ref) {
        if (parsed.ref.join) {
            parsed.refs = parsed.ref;
        }
        else {
            parsed.refs = [parsed.ref];
        }
        delete parsed.ref;
    }
    parsed.refs = setDefault(parsed.refs, []);
    parsed.raw = setDefault(parsed.raw, false);
    parsed.wip = setDefault(parsed.wip, true);
    parsed.port = setDefault(parsed.port, 3000);
    parsed.pretty = setDefault(parsed.pretty, true);
    parsed.source = setDefault(parsed.source, null);
    parsed.yuipath = setDefault(parsed.yuipath, null);
    parsed.timeout = setDefault(parsed.timeout, 300);
    parsed.multiseed = setDefault(parsed.multiseed, false);
    parsed.iterations = setDefault(parsed.iterations, 1);

    parsed.timeout *= 1000; // Convert from seconds to ms

    if (parsed.wip !== false) {
        parsed.refs.push("WIP");
    }

    return parsed;
};

exports.has = has;
exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
