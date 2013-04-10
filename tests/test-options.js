var vows = require('vows'),
    assert = require('assert'),
    parse = require('../lib/options').parse;


vows.describe('option --wip').addBatch({
    'as false': {
        topic: parse(['--wip', 'false']),
        'should resolve to false': function (options) {
            assert.strictEqual(options.wip, false);
        }
    },
    'as true': {
        topic: parse(['--wip', 'true']),
        'should resolve to true': function (options) {
            assert.strictEqual(options.wip, true);
        }
    },
    'as foo': {
        topic: parse(['--wip', 'true']),
        'should resolve to true': function (options) {
            assert.strictEqual(options.wip, true);
        }
    }
}).export(module);


vows.describe('option --ref').addBatch({
    'specified with version': {
        topic: parse(['--ref', 'v3.9.0']),
        'should resolve to v3.9.0 and WIP': function (options) {
            assert.deepEqual(options.refs, ['v3.9.0', 'WIP']);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to WIP': function (options) {
            assert.deepEqual(options.refs, ['WIP']);
        }
    },
    'specified with version and no wip': {
        topic: parse(['--ref', 'v3.9.0', '--wip', 'false']),
        'should resolve to v3.9.0': function (options) {
            assert.deepEqual(options.refs, ['v3.9.0']);
        }
    },
    'specified without version and wip': {
        topic: parse(['--wip', 'false']),
        'should resolve to nothing': function (options) {
            assert.deepEqual(options.refs, []);
        }
    }
}).export(module);


vows.describe('option --source').addBatch({
    'specified': {
        topic: parse(['--source', '/path/to/source']),
        'should resolve to the path': function (options) {
            assert.deepEqual(options.source, '/path/to/source');
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to null': function (options) {
            assert.deepEqual(options.source, null);
        }
    }
}).export(module);


vows.describe('option --yuipath').addBatch({
    'specified': {
        topic: parse(['--yuipath', '/path/to/yui']),
        'should resolve to the path': function (options) {
            assert.deepEqual(options.yuipath, '/path/to/yui');
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to null': function (options) {
            assert.deepEqual(options.yuipath, null);
        }
    }
}).export(module);


vows.describe('option --raw').addBatch({
    'specified': {
        topic: parse(['--raw', 'true']),
        'should resolve to the path': function (options) {
            assert.deepEqual(options.raw, true);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to false': function (options) {
            assert.deepEqual(options.raw, false);
        }
    }
}).export(module);


vows.describe('option --pretty').addBatch({
    'specified': {
        topic: parse(['--pretty', 'true']),
        'should resolve to the value': function (options) {
            assert.deepEqual(options.pretty, true);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to true': function (options) {
            assert.deepEqual(options.pretty, true);
        }
    }
}).export(module);



vows.describe('option --multiseed').addBatch({
    'specified': {
        topic: parse(['--multiseed', 'true']),
        'should resolve to the value': function (options) {
            assert.deepEqual(options.multiseed, true);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to false': function (options) {
            assert.deepEqual(options.multiseed, false);
        }
    }
}).export(module);



vows.describe('option --port').addBatch({
    'specified': {
        topic: parse(['--port', '3001']),
        'should resolve to the value': function (options) {
            assert.deepEqual(options.port, 3001);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to 3000': function (options) {
            assert.deepEqual(options.port, 3000);
        }
    }
}).export(module);




vows.describe('option --timeout').addBatch({
    ' --timeout specified': {
        topic: parse(['--timeout', '500']),
        'should resolve to the value': function (options) {
            assert.deepEqual(options.timeout, 500000);
        }
    },
    ' --timeout unspecified': {
        topic: parse([]),
        'should resolve to 3000': function (options) {
            assert.deepEqual(options.timeout, 300000);
        }
    }
}).export(module);





vows.describe('option --iterations').addBatch({
    'specified': {
        topic: parse(['--iterations', '2']),
        'should resolve to the value': function (options) {
            assert.deepEqual(options.iterations, 2);
        }
    },
    'unspecified': {
        topic: parse([]),
        'should resolve to 1': function (options) {
            assert.deepEqual(options.iterations, 1);
        }
    }
}).export(module);



