/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var vows = require('vows'),
    assert = require('assert'),
    utilities = require('../lib/utilities'),
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

vows.describe('utilities').addBatch(tests).export(module);
