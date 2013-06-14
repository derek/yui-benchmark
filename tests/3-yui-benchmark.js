/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var argv = ['--yuipath=../yui3', '--source=./examples/benchmarkjs-suite.js', '--ref=v3.8.0'];

var fs = require("fs"),
    vows = require('vows'),
    assert = require('assert'),
    site = require('../lib/app/server'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    parseOptions = require('../lib/utilities').parseOptions;

function execute (test, vow) {
    var topic = vow.context.topics[0];
    test = test.bind(topic);

    test(function () {
        vow.callback(null, topic);
    });
}

vows.describe('YUI Benchmark').addBatch({
    'yui-benchmark': {
        'topic': function () {
            return new YUIBenchmark(parseOptions(argv));
        },
        'teardown': function (topic) {
            topic.server.close();
        },
        'should initialize values correctly' : function (topic) {
            assert.deepEqual([], topic.results);
            assert.deepEqual([], topic.tasks);
            assert.deepEqual([], topic.testURLs);
            assert.deepEqual({}, topic.refTable);
            assert.deepEqual({}, topic.shaTable);
            assert.equal(null, topic.server);
            assert.equal(null, topic.yuipath);
            assert.equal(null, topic.yetiHub);
            assert.equal(null, topic.yetiClient);
            assert.equal(0, topic.batchCount);
            assert.equal(0, topic.batchesComplete);
            assert.equal('/Users/derek/src/yui/yui-benchmark/lib/', topic.yuiBenchPath);
            assert.deepEqual({ refs: [ 'v3.8.0', 'WIP' ],
                yuipath: '/Users/derek/src/yui/yui3',
                source: '/Users/derek/src/yui/yui-benchmark/examples/benchmarkjs-suite.js',
                raw: false,
                wip: true,
                port: 3000,
                pretty: true,
                timeout: 300000,
                multiseed: false,
                iterations: 1,
                tmproot: '/var/folders/fk/ygyb947s6mv5lhv4pm321h880000gn/T/' }, topic.config);
        },
        '> findYUI' : {
            topic: function (topic) {
                execute(topic.findYUI, this);
            },
            'should find the seed file': function (topic) {
                assert.equal(topic.yuipath, '/Users/derek/src/yui/yui3');
            },
            '> prepSHAs' : {
                topic: function (topic) {
                    execute(topic.prepSHAs, this);
                },
                'should populate refTable': function (topic) {
                    assert.equal(topic.refTable['v3.8.0'], 'd89374d7213ad8260e5004200e8f99efd54e705b');
                    assert.equal(topic.refTable['WIP'], 'WIP');
                },
                'and shaTable': function (topic) {
                    assert.equal(topic.shaTable['d89374d7213ad8260e5004200e8f99efd54e705b'], 'v3.8.0');
                    assert.equal(topic.shaTable['WIP'], 'WIP');
                },
                '> prepRepos' : {
                    topic: function (topic) {
                        execute(topic.prepRepos, this);
                    },
                    'should foo': function (topic) {
                        // Anything?
                    },
                    '> createTasks' : {
                        topic: function (topic) {
                            execute(topic.createTasks, this);
                        },
                        'should create 2 tasks': function (topic) {
                            assert.equal(topic.tasks.length, 2);
                        },
                        'with 1 test each': function (topic) {
                            topic.tasks.forEach(function (task) {
                                assert.equal(task.tests.length, 1);
                            });
                        },
                        'and the build files should exist': function (topic) {
                            topic.tasks.forEach(function (task) {
                                task.tests.forEach(function (test) {
                                    var seedPath = test.repository + '/build/yui/yui.js';
                                    assert.isTrue(fs.existsSync(seedPath));
                                });
                            });
                        },
                        '> gatherTestURLs' : {
                            topic: function (topic) {
                                execute(topic.gatherTestURLs, this);
                            },
                            'should gather two URLs': function (topic) {
                                assert.equal(topic.testURLs.length, 2);
                            },
                            '> startExpress' : {
                                topic: function (topic) {
                                    execute(topic.startExpress, this);
                                },
                                'should fire up express': function (topic) {
                                    assert.isNotEmpty(topic.server);
                                },
                                '> startYeti' : {
                                    topic: function (topic) {
                                        execute(topic.startYeti, this);
                                    },
                                    'should fire up yeti': function (topic) {
                                        assert.isNotEmpty(topic.yetiHub);
                                        assert.isNotEmpty(topic.yetiClient);
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
