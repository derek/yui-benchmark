/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
'use strict';

var osenv = require('osenv'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    tmpdir = osenv.tmpdir(),
    tmpsubdirs = fs.readdirSync(tmpdir);

console.log('Scanning', tmpdir);

tmpsubdirs.forEach(function (dir) {
    if (dir.match(/^yui3-/)) {
        rmdir(path.join(tmpdir, dir));
    }
});

function rmdir (dir) {
    console.log('Cleaning ' + dir);
    exec('rm -rf ' + dir);
}
