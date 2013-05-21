/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var path = require('path'),
    osenv = require("osenv");

var configurables = {
    refs: {
        type: Array,
        value: null
    },
    source: {
        type: path,
        value: null
    },
    yuipath: {
        type: path,
        value: null
    },
    wip: {
        type: Boolean,
        value: true
    },
    raw: {
        type: Boolean,
        value: false
    },
    pretty: {
        type: Boolean,
        value: true
    },
    multiseed: {
        type: Boolean,
        value: false
    },
    port: {
        type: Number,
        value: 3000
    },
    timeout: {
        type: Number,
        value: 300
    },
    iterations: {
        type: Number,
        value: 1
    },
    tmproot: {
        type: path,
        value: osenv.tmpdir()
    }
};

module.exports = {
    configurables: configurables
};
