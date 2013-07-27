#!/usr/bin/env node

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

'use strict';

var osenv = require('osenv'),
    path = require('path'),
    glob = require('glob'),
    rimraf = require('rimraf'),
    tmproot = osenv.tmpdir();

function remove(p) {
    console.log('Removing %s', p);
    rimraf(p, function () {});
}

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