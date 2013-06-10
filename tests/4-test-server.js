var argv = ['--yuipath=../yui3', '--source=./examples/benchmarkjs-suite.js', '--ref=v3.8.0'];

var vows = require('vows'),
    assert = require('assert'),
    site = require('../lib/app/server');

var YUIBenchmark = require('../lib/app/yui-benchmark'),
    parseOptions = require('../lib/util/misc').parseOptions,
    yb = new YUIBenchmark(parseOptions(argv));

function getMockResponse (route, request) {
    var vow = this;

	return route(request, {
		writeHead: function () { },
		end: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length > 0) {
				args.unshift(false);
			}
			return vow.callback.apply(this, args);
		}
	});
}

var tests = {
    'after yui-benchmark completes the boot process, ': {
        topic: function () {
            var callback = this.callback;
            yb.on('ready', function () {
                // Close the server, cause these tests don't need it
                yb.server.close();
                callback();
            });
            yb.boot();
        },
        'index': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.index);
            },
            'should process correctly': function (response) {
                assert.isUndefined(response);
            }
        },
        'asset': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.asset, {
                    url: 'tests/assets/ok.txt'
                });
            },
            'should process correctly': function (response) {
                assert.equal(response, 'ok');
            }
        },
        'benchmarkjs': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.benchmarkjs);
            },
            'should process correctly': function (response) {
                assert.match(response, /Benchmark.js v1\.0\.0/);
            }
        },
        'yuibenchmarkjs': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.yuibenchmarkjs);
            },
            'should process correctly': function (response) {
                assert.match(response, /\@module yui\-benchmark/);
            }
        },
        'bareYUI': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.bareYUI, {
                    params: ['yui/yui.js'],
                    app: {
                        get: function (val) {
                            if (val === 'yuipath') {
                                return '/Users/derek/src/yui/yui3';
                            }
                        }
                    }
                });
            },
            'should process correctly': function (response) {
                assert.match(response, /\@module yui/);
            }
        },
        'wrappedTest': {
            topic: function () {
                var request = getMockResponse.bind(this),
                    taskID = yb.tasks[0].meta.id,
                    testID = yb.tasks[0].tests[0].id;

                return request(site.wrappedTest, {
                    params: {
                        taskID: taskID,
                        testID: testID
                    },
                    app: {
                        get: function (val) {
                            if (val === 'tasks') {
                                return yb.tasks;
                            }
                        }
                    }
                });
            },
            'should process correctly': function (response) {
                assert.match(response, /YUI\.add/);
            }
        },
        'wrappedYUI': {
            topic: function () {
                var request = getMockResponse.bind(this),
                    taskID = yb.tasks[0].meta.id,
                    testID = yb.tasks[0].tests[0].id;

                return request(site.wrappedYUI, {
                    params: {
                        0: 'build/yui/yui.js',
                        taskID: taskID,
                        testID: testID
                    },
                    app: {
                        get: function (val) {
                            if (val === 'tasks') {
                                return yb.tasks;
                            }
                        }
                    }
                });
            },
            'should process correctly': function (response) {
                assert.match(response, /\@module yui/);
            }
        },
        'task': {
            topic: function () {
                var request = getMockResponse.bind(this),
                    taskID = yb.tasks[0].meta.id;

                return request(site.task, {
                    params: {
                        taskID: taskID
                    },
                    headers: {
                        'user-agent': 'firefox'
                    },
                    app: {
                        get: function (val) {
                            if (val === 'tasks') {
                                return yb.tasks;
                            }
                        }
                    }
                });
            },
            'should process correctly': function (response) {
                assert.match(response, /<script src\=\"\/yeti\/public\/inject.js\"><\/script>/);
            }
        }
    }
};

vows.describe('site').addBatch(tests).export(module);
