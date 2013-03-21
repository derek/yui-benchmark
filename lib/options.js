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
        datapath: path,
        yuipath: path,
        results: Boolean,
        pretty: Boolean,
        raw: Boolean,
        sortrefs: Boolean,
        iterations: Number
    });

// Make sure some important files exist
if (!options.yuipath || !fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
    throw new Error("yui.js not found. Check --yuipath option");
}

if (!options.source || !fs.existsSync(path.join(options.source))) {
    throw new Error("source not found. Check --source option");
}

if (options.datapath && !fs.existsSync(path.join(options.datapath))) {
    throw new Error("datapath directory not found. Check --datapath option");
}

// Normalize ref as an array
if (options.ref && !options.ref.push) {
    options.ref = [options.ref];
}

if (!options.ref) {
    options.ref = [];
}

options.refs = options.ref;
delete options.ref;

if (options.wip !== false) {
    options.refs.push("WIP");
}

if (options.refs.length < 1) {
    throw new Error("No ref(s) not specified. Check --ref option");
}

if (options.sortrefs) {    
    options.refs.sort();

    if (options.refs[0] === "WIP") {
        // Put WIP at the end.
        options.refs.push(options.refs.shift());
    }
}

options.raw = (options.raw === undefined ? false : options.raw);
options.port = (options.port === undefined ? 3000 : options.port);
options.pretty = (options.pretty === undefined ? true : options.pretty);
options.iterations = (options.iterations === undefined ? 1 : options.iterations);

module.exports = options;