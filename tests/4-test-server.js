/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var fs = require('fs'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    site = require('../lib/app/server'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    parseOptions = require('../lib/utilities').parseOptions,
    repo = path.resolve(process.env.YUI3_PATH),
    tmp = path.join(repo, '.builds');

if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
}

var argv = [
    '--yui-repo=' + repo,
    '--source=./tests/assets/3/config.js',
    '--ref=v3.8.0',
    '--loglevel=debug',
    '--tmp=' + tmp
];

var yb = new YUIBenchmark(parseOptions(argv));

function getMockResponse (route, request) {
    /*jshint validthis:true */
    var vow = this,
        head = '';

	return route(request, {
		writeHead: function (code, headers) { },
		end: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length > 0) {
				args.unshift(false);
			}

			return vow.callback.apply(this, args, head);
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
                return request(site.assets, {
                    params: {
                        taskID: 0,
                        file: 'ok.txt'
                    },
                    url: 'tests/assets/ok.txt',
                    app: {
                        get: function (val) {
                            if (val === 'repo') {
                                return repo;
                            }
                            else if (val === 'tasks') {
                                return yb.tasks;
                            }
                        }
                    }
                });
            },
            'should process correctly': function (response) {
                assert.equal(response, 'ok');
            }
        },
        'invalid asset': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.assets, {
                    params: {
                        taskID: 0,
                        file: 'foobar'
                    },
                    url: 'tests/assets/ok.txt',
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
                assert.equal(response, undefined);
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
        'yui': {
            topic: function () {
                var request = getMockResponse.bind(this);
                return request(site.yui, {
                    params: {
                        0: '/yui/yui.js',
                        taskID: 0
                    },
                    app: {
                        get: function (val) {
                            if (val === 'repo') {
                                return repo;
                            }
                            else if (val === 'tasks') {
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
                    taskID = yb.tasks[0].taskID;

                return request(site.test, {
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
