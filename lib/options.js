/*
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
        results: Boolean,
        pretty: Boolean,
        raw: Boolean,
        iterations: Number
    });

// Make sure some important files exist
if (options.yuipath === undefined || !fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
    throw new Error("yui.js not found. Check --yuipath option");
}

if (options.source === undefined || !fs.existsSync(path.join(options.source))) {
    throw new Error("source not found. Check --source option");
}

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

if (options.wip !== false) {
    options.refs.push("WIP");
}

if (options.refs.length < 1) {
    throw new Error("No ref(s) not specified. Check --ref option");
}

options.raw = (options.raw === undefined ? false : options.raw);
options.port = (options.port === undefined ? 3000 : options.port);
options.pretty = (options.pretty === undefined ? true : options.pretty);
options.iterations = (options.iterations === undefined ? 1 : options.iterations);

module.exports = options;