/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    parser = require('../lib/app/parser'),
    raw = require(path.join(__dirname, 'assets/7/in/results.json'), 'utf-8'),
    tests = {};

tests['prettify'] = {
    topic: parser.prettify(raw),
   	'should exist': function (actual) {
   		var expected = fs.readFileSync(path.join(__dirname, 'assets/7/out/table.txt'), 'utf-8');
		assert.equal(expected, actual);
   	}
};

vows.describe('parser').addBatch(tests).export(module);
