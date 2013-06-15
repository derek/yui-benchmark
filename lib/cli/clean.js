/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var osenv = require("osenv"),
    rimraf = require("rimraf"),
    tmpdir = osenv.tmpdir(),
    path = tmpdir + 'yui3-*';

console.log("Cleaning " + path);

rimraf(path, function () {
    console.log("Done");
});
