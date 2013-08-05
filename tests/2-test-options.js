/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var vows = require('vows'),
    assert = require('assert'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    normalizeConfig = YUIBenchmark.prototype.normalizeConfig,
    parseOptions = require('../lib/utilities').parseOptions;

function parse (options) {
    return normalizeConfig(parseOptions(options));
}

var tests = {
    '--working' : {
        'unspecified': {
            topic: parse([]).working,
            'should resolve to true': function (working) {
                assert.isTrue(working);
            }
        },
        'as false': {
            topic: parse(['--working', 'false']).working,
            'should resolve to false': function (working) {
                assert.isFalse(working);
            }
        },
        'as true': {
            topic: parse(['--working', 'true']).working,
            'should resolve to true': function (working) {
                assert.isTrue(working);
            }
        },
        'as foo': {
            topic: parse(['--working', 'foo']).working,
            'should resolve to true': function (working) {
                assert.isTrue(working);
            }
        }
    },

    '--ref' : {
        'unspecified': {
            topic: parse([]).refs,
            'should resolve to working': function (refs) {
                assert.deepEqual(refs, ['Working']);
            }
        },
        'specified with version': {
            topic: parse(['--ref', 'v3.9.0']).refs,
            'should resolve to v3.9.0 and working': function (refs) {
                assert.deepEqual(refs, ['v3.9.0', 'Working']);
            }
        },
        'specified with version and no working': {
            topic: parse(['--ref', 'v3.9.0', '--working', 'false']).refs,
            'should resolve to v3.9.0': function (refs) {
                assert.deepEqual(refs, ['v3.9.0']);
            }
        },
        'specified without version and working': {
            topic: parse(['--working', 'false']).refs,
            'should resolve to nothing': function (refs) {
                assert.deepEqual(refs, []);
            }
        }
    },

    '--source' : {
        'unspecified': {
            topic: parse([]).source,
            'should resolve to null': function (source) {
                assert.isNull(source);
            }
        },
        'specified': {
            topic: parse(['--source', '/path/to/source']).source,
            'should resolve to the given value': function (source) {
                assert.equal(source, '/path/to/source');
            }
        }
    },

    '--repo' : {
        'unspecified': {
            topic: parse([]).repo,
            'should resolve to null': function (repo) {
                assert.isNull(repo);
            }
        },
        'specified': {
            topic: parse(['--repo', '/path/to/yui']).repo,
            'should resolve to the given value': function (repo) {
                assert.deepEqual(repo, '/path/to/yui');
            }
        }
    },

    '--raw' : {
        'unspecified': {
            topic: parse([]).raw,
            'should resolve to false': function (raw) {
                assert.isUndefined(raw);
            }
        },
        'specified': {
            topic: parse(['--raw', '/path/to/out.json']).raw,
            'should resolve to true': function (raw) {
                assert.equal(raw, '/path/to/out.json');
            }
        }
    },

    '--port' : {
        'unspecified': {
            topic: parse([]).port,
            'should resolve to 3000': function (port) {
                assert.equal(port, 3000);
            }
        },
        'specified': {
            topic: parse(['--port', '3001']).port,
            'should resolve to the given value': function (port) {
                // console.log(parse(['--port', '3001']));
                assert.equal(port, 3001);
            }
        }
    },

    '--iterations' : {
        'unspecified': {
            topic: parse([]).iterations,
            'should resolve to 1': function (iterations) {
                assert.equal(iterations, 1);
            }
        },
        'specified': {
            topic: parse(['--iterations', '2']).iterations,
            'should resolve to the given value': function (iterations) {
                assert.equal(iterations, 2);
            }
        }
    },

    '--timeout' : {
        'unspecified': {
            topic: parse([]).timeout,
            'should resolve to 300000': function (timeout) {
                assert.equal(timeout, 300000);
            }
        },
        'specified': {
            topic: parse(['--timeout', '500']).timeout,
            'should resolve to the given value x 1000': function (timeout) {
                assert.equal(timeout, 500000);
            }
        }
    }
};

vows.describe('args').addBatch(tests).export(module);
