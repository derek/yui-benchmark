/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var path = require("path"),
    nopt = require("nopt"),
    configurables = require('../util/constants').configurables;

function parse (argv, offset) {
    var options = nopt({}, {}, argv, (offset || 0));

    // TODO should just be a warning
    if (options.argv.remain.length > 0) {
        throw new Error("Unknown argv detected");
    }
    delete options.argv;

    if (options.ref) {
        if (options.ref.join) {
            options.refs = options.ref;
        }
        else {
            options.refs = [options.ref];
        }
        delete options.ref;
    }

    Object.keys(configurables).forEach(function (key) {
        options[key] = setDefault(options[key], configurables[key].value);
    });

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
    parse: parse
};
