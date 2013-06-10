var vows = require('vows'),
    assert = require('assert'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    normalizeConfig = YUIBenchmark.prototype.normalizeConfig,
    parseOptions = require('../lib/util/misc').parseOptions;

function parse (options) {
    return normalizeConfig(parseOptions(options));
}

var tests = {
    '--wip' : {
        'unspecified': {
            topic: parse([]).wip,
            'should resolve to true': function (wip) {
                assert.isTrue(wip);
            }
        },
        'as false': {
            topic: parse(['--wip', 'false']).wip,
            'should resolve to false': function (wip) {
                assert.isFalse(wip);
            }
        },
        'as true': {
            topic: parse(['--wip', 'true']).wip,
            'should resolve to true': function (wip) {
                assert.isTrue(wip);
            }
        },
        'as foo': {
            topic: parse(['--wip', 'foo']).wip,
            'should resolve to true': function (wip) {
                assert.isTrue(wip);
            }
        }
    },

    '--ref' : {
        'unspecified': {
            topic: parse([]).refs,
            'should resolve to WIP': function (refs) {
                assert.deepEqual(refs, ['WIP']);
            }
        },
        'specified with version': {
            topic: parse(['--ref', 'v3.9.0']).refs,
            'should resolve to v3.9.0 and WIP': function (refs) {
                assert.deepEqual(refs, ['v3.9.0', 'WIP']);
            }
        },
        'specified with version and no wip': {
            topic: parse(['--ref', 'v3.9.0', '--wip', 'false']).refs,
            'should resolve to v3.9.0': function (refs) {
                assert.deepEqual(refs, ['v3.9.0']);
            }
        },
        'specified without version and wip': {
            topic: parse(['--wip', 'false']).refs,
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

    '--yuipath' : {
        'unspecified': {
            topic: parse([]).yuipath,
            'should resolve to null': function (yuipath) {
                assert.isNull(yuipath);
            }
        },
        'specified': {
            topic: parse(['--yuipath', '/path/to/yui']).yuipath,
            'should resolve to the given value': function (yuipath) {
                assert.deepEqual(yuipath, '/path/to/yui');
            }
        }
    },

    '--raw' : {
        'unspecified': {
            topic: parse([]).raw,
            'should resolve to false': function (raw) {
                assert.isFalse(raw);
            }
        },
        'specified': {
            topic: parse(['--raw', 'true']).raw,
            'should resolve to true': function (raw) {
                assert.isTrue(raw);
            }
        }
    },

    '--pretty' : {
        'unspecified': {
            topic: parse([]).pretty,
            'should resolve to true': function (pretty) {
                assert.isTrue(pretty);
            }
        },
        'specified': {
            topic: parse(['--pretty', 'true']).pretty,
            'should resolve to true': function (pretty) {
                assert.isTrue(pretty);
            }
        }
    },

    '--multiseed' : {
        'unspecified': {
            topic: parse([]).multiseed,
            'should resolve to false': function (multiseed) {
                assert.isFalse(multiseed);
            }
        },
        'specified': {
            topic: parse(['--multiseed', 'true']).multiseed,
            'should resolve to true': function (multiseed) {
                assert.isTrue(multiseed);
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
    }
};

vows.describe('args').addBatch(tests).export(module);
