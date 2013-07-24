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
    glob = require('glob'),
    rimraf = require('rimraf'),
    tmproot = osenv.tmpdir();

glob('.builds/*', function (err, paths) {
    paths.forEach(function (p) {
        remove(path.join(process.cwd(), p));
    });
});

glob('yui3-*', {cwd: tmproot}, function (err, paths) {
    paths.forEach(function (p) {
        remove(path.join(tmproot, p));
    });
});

function remove(p) {
    console.log('Removing %s', p);
    rimraf(p, function () {});
}