var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    util = require('../lib/util');

vows.describe('yuiBenchPath').addBatch({
    'is correct': {
        topic: util.yuiBenchPath,
        'should resolve to the application root path': function (yuiBenchPath) {
            assert.strictEqual(yuiBenchPath, path.join(__dirname, '../'));
        }
    }
}).export(module);


vows.describe('refTable').addBatch({
    'is correct': {
        topic: util.refTable,
        'should resolve to an empty object': function (refTable) {
            assert.isEmpty(refTable);
        }
    }
}).export(module);


vows.describe('shaTable').addBatch({
    'is correct': {
        topic: util.shaTable,
        'should resolve to an empty object': function (shaTable) {
            assert.isEmpty(shaTable, {});
        }
    }
}).export(module);

