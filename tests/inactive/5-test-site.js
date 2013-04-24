var vows = require('vows'),
    assert = require('assert'),
    site = require('../lib/site');

function getMock (route, test, request) {
	return route(request, {
		writeHead: function () { },
		end: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length > 0) {
				args.unshift(false);
			}
			return test.callback.apply(this, args);
		}
	});
}

var tests = {
    'index': {
        topic: function () {
			var req = {};
			return getMock(site.index, this, req);
        },
        'should process correctly': function (response) {
			assert.isUndefined(response);
        }
    },
    'asset': {
        topic: function () {
			var req = {
				url: 'tests/assets/ok.txt'
			};

			return getMock(site.asset, this, req);
        },
        'should process correctly': function (response) {
			assert.equal('ok', response);
        }
    },
    'benchmarkjs': {
        topic: function () {
			var req = {};
			return getMock(site.benchmarkjs, this, req);
        },
        'should process correctly': function (response) {
			assert.match(response, /Benchmark.js v1\.0\.0/);
        }
    },
    'yuibenchmarkjs': {
        topic: function () {
			var req = {};
			return getMock(site.yuibenchmarkjs, this, req);
        },
        'should process correctly': function (response) {
            assert.match(response, /\@module yui\-benchmark/);
        }
    },
    'bareYUI': {
        topic: function () {
            var req = {
                params: ['yui/yui.js']
            };
            return getMock(site.bareYUI, this, req);
        },
        'should process correctly': function (response) {
            assert.match(response, /\@module yui/);
        }
    },
    'wrappedTest': {
        topic: function () {
            var req = {
                params: {
                    taskID: 0,
                    testID: 0
                }
            };
            return getMock(site.wrappedTest, this, req);
        },
        'should process correctly': function (response) {
            assert.match(response, /YUI\.add/);
        }
    },
    'wrappedYUI': {
        topic: function () {
            var req = {
                params: {
                    0: 'build/yui/yui.js',
                    taskID: 0,
                    testID: 0
                }
            };
			return getMock(site.wrappedYUI, this, req);
        },
        'should process correctly': function (response) {
            assert.match(response, /\@module yui/);
        }
    }
}

vows.describe('site').addBatch(tests).export(module);