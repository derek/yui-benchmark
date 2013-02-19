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
        output: path,
        yuipath: path,
        results: Boolean,
        sortrefs: Boolean,
    }),
    refs;

// Make sure some important files exist
if (!options.yuipath || !fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
    throw new Error("yui.js not found. Check --yuipath option");
}

if (!options.source || !fs.existsSync(path.join(options.source))) {
    throw new Error("source not found. Check --source option");
}

if (!options.output || !fs.existsSync(path.join(options.output))) {
    throw new Error("output directory not found. Check --output option");
}

if (!options.ref) {
    throw new Error("ref(s) not specified. Check --ref option");
}

// Normalize ref as an array
if (!options.ref.push) {
    options.ref = [options.ref];
}

options.refs = options.ref;
delete options.ref;

if (options.refs.indexOf('head') !== -1) {
    options.refs[options.refs.indexOf('head')] = "HEAD";
}

if (options.sortrefs) {    
    options.refs.sort();

    if (options.refs[0] === "HEAD") {
        // Put HEAD at the end.
        options.refs.push(options.refs.shift());
    }
}

options.port = options.port || 3000,

module.exports = options;