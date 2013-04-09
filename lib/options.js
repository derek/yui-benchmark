/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    path = require("path"),
    nopt = require("nopt"),
    options = nopt({
        ref: [String, Array],
        source: path,
        yuipath: path,
        pretty: Boolean,
        multiseed: Boolean,
        raw: Boolean,
        iterations: Number,
        port: Number,
        timeout: Number,
        wip: Boolean
    });

// rename ref to refs
options.refs = options.ref;
delete options.ref;

// Normalize refs as an array
if (options.refs && !options.refs.push) {
    options.refs = [options.refs];
}
else if (options.refs === undefined) {
    options.refs = [];
}
options.source = (options.source === undefined ? null : options.source);
options.yuipath = (options.yuipath === undefined ? null : options.yuipath);
options.raw = (options.raw === undefined ? false : options.raw);
options.port = (options.port === undefined ? 3000 : options.port);
options.pretty = (options.pretty === undefined ? true : options.pretty);
options.iterations = (options.iterations === undefined ? 1 : options.iterations);
options.multiseed = (options.multiseed === undefined ? false : true);
options.timeout = (options.timeout === undefined ? (300 * 1000) : (options.timeout * 1000));
options.wip = (options.wip === undefined ? true : false);

if (options.wip !== false) {
    options.refs.push("WIP");
}

if (options.refs.length < 1) {
    throw new Error("No ref(s) not specified. Check --ref option");
}

module.exports = options;
