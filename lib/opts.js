/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require("path"),
    nopt = require("nopt"),
    options = nopt({
        "source" : path, 
        "yuipath" : path, 
        "output" : path
    }, {}, process.argv, 2);

// Normalize ref as an array
if (!options.ref.push) {
    options.ref = [options.ref];
}

module.exports = options;