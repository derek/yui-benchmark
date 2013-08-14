/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    utilities = require('../lib/utilities'),
    srcConfig1 = fs.readFileSync(path.join(__dirname, 'assets/6/in/config-1.js'), 'utf-8'),
    srcConfig2 = fs.readFileSync(path.join(__dirname, 'assets/6/in/config-2.js'), 'utf-8'),
    tests = {};

tests['htmlEntitiesDecode'] = {
    topic: utilities.htmlEntitiesDecode('&amp;&lt;&gt;&quot;'),
   	'should decode a string properly': function (actual) {
		assert.equal('&<>"', actual);
   	}
};

tests['htmlEntitiesEncode'] = {
    topic: utilities.htmlEntitiesEncode('&<>"'),
    'should encode a string properly': function (actual) {
        assert.equal('&amp;&lt;&gt;&quot;', actual);
    }
};

tests['getLocalIP'] = {
    topic: utilities.getLocalIP(),
    'should encode a string properly': function (actual) {
        assert.isNotNull(actual.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/));
    }
};

tests['parseSuiteSource'] = {
    'on a good source file': {
        topic: utilities.parseSuiteSource(srcConfig1),
        'should parse': function (actual) {
            assert.equal('Test suite 01', actual.name);
            assert.equal('1', actual.tests.length);
        }
    }
};

tests['validateSuite'] = {
    'on a good source file': {
        topic: utilities.validateSuite(srcConfig1),
        'should validate': function (actual) {
            assert.equal(true, actual);
        }
    },
    'on a bad source file': {
        topic: utilities.validateSuite(srcConfig2),
        'should not validate': function (actual) {
            assert.equal(false, actual);
        }
    }
};

vows.describe('utilities').addBatch(tests).export(module);
