/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var fs = require("fs"),
    path = require("path"),
    vows = require('vows'),
    assert = require('assert'),
    osenv = require("osenv"),
    site = require('../lib/app/server'),
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
                execute(topic.findYUI, this);
            },
            'should find the seed file': function (topic) {
                assert.equal(topic.yuipath, yuipath);
            },
            '> prepSHAs' : {
                topic: function (topic) {
                    execute(topic.prepSHAs, this);
                },
                'should populate refTable': function (topic) {
                    assert.equal(topic.refTable['v3.8.0'].sha, 'd89374d7213ad8260e5004200e8f99efd54e705b');
                    assert.equal(topic.refTable['WIP'].ref, 'WIP');
                },
                '> createTasks' : {
                    topic: function (topic) {
                        execute(topic.createTasks, this);
                    },
                    'should create 2 tasks': function (topic) {
                        assert.equal(topic.tasks.length, 4);
                    },
                    '> gatherTestURLs' : {
                        topic: function (topic) {
                            execute(topic.gatherTestURLs, this);
                        },
                        'should gather two URLs': function (topic) {
                            assert.equal(topic.testURLs.length, 4);
                        },
                        '> prepRepos' : {
                            topic: function (topic) {
                                execute(topic.prepRepos, this);
                            },
                            'so the build files exist': function (topic) {
                                topic.tasks.forEach(function (task) {
                                    var seedPath = task.buildPath + '/yui/yui.js';
                                    assert.isTrue(fs.existsSync(seedPath));
                                });
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
