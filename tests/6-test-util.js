var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    util = require('../lib/util');

var tests = {
    'yuiBenchPath': {
        'is correct': {
            topic: util.yuiBenchPath,
            'should resolve to the application root path': function (yuiBenchPath) {
                assert.strictEqual(yuiBenchPath, path.join(__dirname, '../'));
            }
        }
    },
    'refTable': {
        'is correct': {
            topic: util.refTable,
            'should resolve to an empty object': function (refTable) {
                assert.isEmpty(refTable);
            }
        }
    },
    'shaTable': {
        'is correct': {
            topic: util.shaTable,
            'should resolve to an empty object': function (shaTable) {
                assert.isEmpty(shaTable, {});
            }
        }
    }
};

vows.describe('utils').addBatch(tests).export(module);
