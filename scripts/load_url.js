#!/usr/bin/env phantomjs

var page = require('webpage').create(),
    system = require('system');

if (system.args.length === 1) {
    console.log('No input path specified');
    phantom.exit();
}

path = system.args[1];

page.open(path, function (status) {
    if (status !== 'success') {
        console.log('FAIL to load the address');
    }
});

page.onConsoleMessage = function(msg) {
	console.log(msg);
    phantom.exit();
};