#!/usr/bin/env phantomjs

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint latedef:false */
var page = require('webpage').create(),
    system = require('system'),
    path;

if (system.args.length === 1) {
    console.log('No input path specified');
    phantom.exit();
}

path = system.args[1];

loadPage();

function loadPage () {
    console.log('Loading', path);
    page.open(path, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address.  Trying again in 10 seconds...');
            setTimeout(loadPage, 10000);
        }
    });
}

page.onConsoleMessage = function(msg) {
	console.log(msg);
};