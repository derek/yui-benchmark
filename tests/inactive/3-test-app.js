var vows = require('vows'),
    assert = require('assert'),
    app = require('../lib/app'),
    util = require('../lib/util'),
    task = require('../lib/task'),
    options = require('../lib/options').parsed;

var tests = {
    'findYUI' : {
        topic: function () {
            app.findYUI(this.callback);
        },
        'should resolve to the root of the repository': function () {
            assert.equal('/Users/derek/src/yui/yui3', options.yuipath);
        }
    },
    'findSource' : {
        topic: function () {
            app.findSource(this.callback);
        },
        'should resolve to the full path of the source': function () {
            assert.equal('/Users/derek/src/yui/yui-benchmark/examples/benchmarkjs-suite.js', options.source);
        }
    },
    'prepSHAs' : {
        topic: function () {
            app.prepSHAs(this.callback);
        },
        'should populate the refTable': function () {
            assert.equal(util.refTable['v3.9.0'], 'b7d710018c74a268ce8a333a3e7b77c6db349062');
            assert.equal(util.refTable['WIP'], 'WIP');
        },
        'should populate the shaTable': function () {
            assert.equal(util.shaTable['b7d710018c74a268ce8a333a3e7b77c6db349062'], 'v3.9.0');
            assert.equal(util.shaTable['WIP'], 'WIP');
        }
    },
    'createTasks' : {
        topic: function () {
            app.createTasks(this.callback);
        },
        'should create two tasks': function () {
            assert.equal(2, task.tasks.length)
        }
    },
    'gatherTestURLs' : {
        topic: function () {
            app.gatherTestURLs(this.callback);
        },
        'should create two testURLs': function () {
            assert.equal(2, task.tasks.length)
        }
    },
    'gatherTestURLs' : {
        topic: function () {
            app.gatherTestURLs(this.callback);
        },
        'should create two testURLs': function () {
            assert.equal(2, task.tasks.length)
        }
    }
};

vows.describe('app').addBatch(tests).export(module);
