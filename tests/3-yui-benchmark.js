/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var fs = require("fs"),
    path = require("path"),
    vows = require('vows'),
    assert = require('assert'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    parseOptions = require('../lib/utilities').parseOptions,
    yuipath = path.resolve(__dirname, '../../yui3'),
    yuiBenchPath = path.resolve(__dirname, '../'),
    tmproot = path.join(yuipath, '.builds');

if (!fs.existsSync(tmproot)) {
    fs.mkdirSync(tmproot);
}

var argv = [
    '--yuipath=' + yuipath,
    '--source=./tests/assets/3/config.js',
    '--ref=v3.8.0',
    '--loglevel=debug',
    '--tmproot=' + tmproot
];

vows.describe('YUI Benchmark').addBatch({
    'yui-benchmark': {
        'topic': function () {
            var options = parseOptions(argv);
            return new YUIBenchmark(options);
        },
        'teardown': function (topic) {
            if (topic.server) {
                topic.server.close();
            }
        },
        'should initialize values correctly' : function (topic) {
            assert.deepEqual([], topic.results);
            assert.deepEqual([], topic.tasks);
            assert.deepEqual([], topic.testURLs);
            assert.deepEqual({}, topic.refTable);
            assert.equal(null, topic.server);
            assert.equal(null, topic.yuipath);
            assert.equal(null, topic.yetiHub);
            assert.equal(null, topic.yetiClient);
            assert.equal(0, topic.batchCount);
            assert.equal(0, topic.batchesComplete);
            assert.equal(path.join(yuiBenchPath, 'lib/'), topic.yuiBenchPath);
            assert.deepEqual({
                refs: [ 'v3.8.0', 'WIP' ],
                yuipath: yuipath,
                source: path.join(yuiBenchPath, '/tests/assets/3/config.js'),
                raw: false,
                wip: true,
                port: 3000,
                pretty: true,
                timeout: 300000,
                multiseed: false,
                iterations: 1,
                loglevel: 'debug',
                tmproot: tmproot
            }, topic.config);
        },
        '> findYUI' : {
            topic: function (topic) {
                this.yb = topic;
                topic.findYUI(this.callback);
            },
            'should find the seed file': function (topic) {
                assert.equal(this.yb.yuipath, yuipath);
            },
            '> prepSHAs' : {
                topic: function (topic) {
                    this.yb.prepSHAs(this.callback);
                },
                'should populate refTable': function (topic) {
                    assert.equal(this.yb.refTable['v3.8.0'].ref, 'v3.8.0');
                    assert.equal(this.yb.refTable['v3.8.0'].sha, 'd89374d7213ad8260e5004200e8f99efd54e705b');
                    assert.equal(this.yb.refTable.WIP.sha, null);
                    assert.equal(this.yb.refTable.WIP.ref, 'WIP');
                },
                '> createTasks' : {
                    topic: function (topic) {
                        this.yb.createTasks(this.callback);
                    },
                    'should create 2 tasks': function (topic) {
                        assert.equal(this.yb.tasks.length, 2);
                    },
                    '> gatherTestURLs' : {
                        topic: function (topic) {
                            this.yb.gatherTestURLs(this.callback);
                        },
                        'should gather two URLs': function (topic) {
                            assert.equal(this.yb.testURLs.length, 2);
                        },
                        '> prepRepos' : {
                            topic: function (topic) {
                                this.yb.prepRepos(this.callback);
                            },
                            'so the build files exist': function (topic) {
                                this.yb.tasks.forEach(function (task) {
                                    var seedPath = task.buildPath + '/yui/yui.js';
                                    assert.isTrue(fs.existsSync(seedPath));
                                });
                            },
                            '> startExpress' : {
                                topic: function (topic) {
                                    this.yb.startExpress(this.callback);
                                },
                                'should fire up express': function (topic) {
                                    assert.isNotEmpty(this.yb.server);
                                },
                                '> startYeti' : {
                                    topic: function (topic) {
                                        this.yb.startYeti(this.callback);
                                    },
                                    'should fire up yeti': function (topic) {
                                        assert.isNotEmpty(this.yb.yetiHub);
                                        assert.isNotEmpty(this.yb.yetiClient);
                                    },
                                    '> handleResult' : {
                                        topic: function (topic) {
                                            var data = require('../tests/assets/3/results');
                                            this.yb.handleResult('Firefox', {results:data, url:'////0'});
                                            this.callback();
                                        },
                                        'should handle results': function (topic) {
                                            assert.equal(8, this.yb.results.length);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}).export(module);
