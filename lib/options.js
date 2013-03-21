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
        sortrefs: Boolean,
        iterations: Number,
        output: String
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

if (!options.ref) {
    throw new Error("ref(s) not specified. Check --ref option");
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

if (options.refs.indexOf('wip') !== -1) {
    options.refs[options.refs.indexOf('wip')] = "WIP";
}

if (options.sortrefs) {    
    options.refs.sort();

    if (options.refs[0] === "WIP") {
        // Put HEAD at the end.
        options.refs.push(options.refs.shift());
    }
}

options.output = options.output || 'raw',
options.port = options.port || 3000,
options.iterations = options.iterations || 1,

module.exports = options;