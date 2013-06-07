/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var argv = ['--yuipath=../yui3', '--source=./examples/benchmarkjs-suite.js', '--ref=v3.8.0'];

var vows = require('vows'),
    assert = require('assert');

var path = require("path"),
    nopt = require("nopt"),
    fs = require("fs"),
    op = require('../lib/util/options-parser'),
    log = require('../lib/util/log'),
    Configurator = require('../lib/util/configurator'),
    YUIBenchmark = require('../lib/app/yui-benchmark').YUIBenchmark,
    options = op.parse(argv, 0),
    procTimeStart = (+new Date()),
    config, configs, yb, phantomProcess, timerTimeout;

config = new Configurator();
config.import(options);
configs = config.export();

yb = new YUIBenchmark(configs);

var tests = {
    'teardown': function () {
        yb.server.close();
    },
    'yui-benchmark': {
        'topic': yb,
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
        'then findYUI' : {
            topic: function () {
                yb.findYUI(this.callback);
            },
            'should find the seed file': function () {
                assert.equal(yb.yuipath, '/Users/derek/src/yui/yui3');
            },
            'then prepSHAs' : {
                topic: function () {
                    yb.prepSHAs(this.callback);
                },
                'should populate refTable': function () {
                    assert.equal(yb.refTable['v3.8.0'], 'd89374d7213ad8260e5004200e8f99efd54e705b');
                    assert.equal(yb.refTable['WIP'], 'WIP');
                },
                'and shaTable': function () {
                    assert.equal(yb.shaTable['d89374d7213ad8260e5004200e8f99efd54e705b'], 'v3.8.0');
                    assert.equal(yb.shaTable['WIP'], 'WIP');
                },
                'then prepRepos' : {
                    topic: function () {
                        yb.prepRepos(this.callback);
                    },
                    'should foo': function () {
                        // Anything?
                    },
                    'then createTasks' : {
                        topic: function () {
                            yb.createTasks(this.callback);
                        },
                        'should create 2 tasks': function () {
                            assert.equal(yb.tasks.length, 2);
                        },
                        'with 1 test each': function () {
                            yb.tasks.forEach(function (task) {
                                assert.equal(task.tests.length, 1);
                            });
                        },
                        'and the build files should exist': function () {
                            yb.tasks.forEach(function (task) {
                                task.tests.forEach(function (test) {
                                    var seedPath = test.repository + '/build/yui/yui.js';
                                    assert.isTrue(fs.existsSync(seedPath));
                                });
                            });
                        },
                        'then gatherTestURLs' : {
                            topic: function () {
                                yb.gatherTestURLs(this.callback);
                            },
                            'should gather two URLs': function () {
                                assert.equal(yb.testURLs.length, 2);
                            },
                            'then start express' : {
                                topic: function () {
                                    yb.startExpress(this.callback);
                                },
                                'should fire up express': function () {
                                    assert.isNotEmpty(yb.server);
                                },
                                'then start yeti' : {
                                    topic: function () {
                                        yb.startYeti(this.callback);
                                    },
                                    'should fire up yeti': function () {
                                        assert.isNotEmpty(yb.yetiHub);
                                        assert.isNotEmpty(yb.yetiClient);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

vows.describe('args').addBatch(tests).export(module);
