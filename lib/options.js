/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    path = require("path"),
    nopt = require("nopt");

function parse (argv) {
    var offset = (argv ? 0 : 2);
    var argv = (argv || process.argv);
    var options = nopt({
        ref: [String, Array],
        source: path,
        yuipath: path,
        wip: Boolean,
        raw: Boolean,
        pretty: Boolean,
        multiseed: Boolean, 
        port: Number,
        timeout: Number,
        iterations: Number
    }, {}, argv, offset);

    options.refs = setDefault(options.ref, []);
    options.raw = setDefault(options.raw, false);
    options.wip = setDefault(options.wip, true);
    options.port = setDefault(options.port, 3000);
    options.pretty = setDefault(options.pretty, true);
    options.source = setDefault(options.source, null);
    options.yuipath = setDefault(options.yuipath, null);
    options.timeout = setDefault(options.timeout, 300);
    options.multiseed = setDefault(options.multiseed, false);
    options.iterations = setDefault(options.iterations, 1);

    options.timeout *= 1000; // Convert from seconds to ms

    if (options.wip !== false) {
        options.refs.push("WIP");
    }

    // TODO Move to app.js
    // if (options.refs.length < 1) {
    //     throw new Error("No ref(s) not specified. Check --ref option");
    // }

    return options;
}

function setDefault (value, theDefault) {
    if (value === undefined) {
        return theDefault;
    }
    else {
        return value;
    }
}

module.exports = {
    parsed: parse(),
    parse: parse
};