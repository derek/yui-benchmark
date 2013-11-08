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
    mkdirp = require('mkdirp'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    parseOptions = require('../lib/utilities').parseOptions,
    repo = path.resolve(process.env.YUI3_PATH),
    yuiBenchPath = path.resolve(__dirname, '../'),
    tmp = path.join(repo, '.builds'),
    WIP = 'Working';

if (!fs.existsSync(tmp)) {
    mkdirp.sync(tmp);
}

var argv = [
    '--repo=' + repo,
    '--source=./tests/assets/3/config.js',
    '--ref=v3.9.0',
    '--loglevel=debug',
    '--tmp=' + tmp
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
            assert.deepEqual({}, topic.refTable);
            assert.equal(null, topic.server);
            assert.equal(null, topic.repo);
            assert.equal(null, topic.yeti.hub);
            assert.equal(null, topic.yeti.client);
            assert.deepEqual({
                refs: [ 'v3.9.0', 'Working' ],
                repo: repo,
                source: path.join(yuiBenchPath, '/tests/assets/3/config.js'),
                working: true,
                port: 3000,
                iterations: 1,
                timeout: 300000,
                loglevel: 'debug',
                tmp: tmp,
                node: false
            }, topic.config);
        },
        '> bindListeners': {
            topic: function (topic) {
                this.yb = topic;
                topic.bindListeners(this.callback);
            },
            'should parse the suite': function (topic) {
                // should check for an event listener binding
            },
            '> parseSuite': {
                topic: function (topic) {
                    this.yb = topic;
                    topic.parseSuite(this.callback);
                },
                'should parse the suite': function (topic) {
                    assert.equal(this.yb.parsedSuite.name, 'Y.View Performance');
                },
                '> findYUISeed' : {
                    topic: function (topic) {
                        this.yb = topic;
                        topic.findYUISeed(this.callback);
                    },
                    'should find the seed file': function (topic) {
                        assert.equal(this.yb.repo, repo);
                    },
                    '> gatherRefDetails' : {
                        topic: function (topic) {
                            this.yb.gatherRefDetails(this.callback);
                        },
                        'should populate refTable': function (topic) {
                            assert.equal(this.yb.refTable['v3.9.0'].ref, 'v3.9.0');
                            assert.equal(this.yb.refTable['v3.9.0'].sha, 'b7d710018c74a268ce8a333a3e7b77c6db349062');
                            // assert.equal(this.yb.refTable['d89374d7213ad8260e5004200e8f99efd54e705b'].ref, 'd89374d7213ad8260e5004200e8f99efd54e705b');
                            // assert.equal(this.yb.refTable['d89374d7213ad8260e5004200e8f99efd54e705b'].sha, 'd89374d7213ad8260e5004200e8f99efd54e705b');
                            assert.equal(this.yb.refTable[WIP].sha, null);
                            assert.equal(this.yb.refTable[WIP].ref, WIP);
                        },
                        '> createTasks' : {
                            topic: function (topic) {
                                this.yb.createTasks(this.callback);
                            },
                            'should create 2 tasks': function (topic) {
                                assert.equal(this.yb.tasks.length, 2);
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
                                            assert.isNotEmpty(this.yb.yeti.client);
                                        },
                                        '> executeTests' : {
                                            topic: function (topic) {
                                                this.yb.executeTests();
                                                this.callback();
                                            },
                                            'should create a Yeti batch': function (topic) {
                                                assert.isNotEmpty(this.yb.yeti.batch);
                                            },
                                            '> handleAgentResult' : {
                                                topic: function (topic) {
                                                    var data = require('../tests/assets/3/results');
                                                    this.yb.handleAgentResult('Firefox', {results:data, url:'////0'});
                                                    this.callback();
                                                },
                                                'should handle results': function (topic) {
                                                    // console.log(this.yb);
                                                    assert.equal(this.yb.results.length, 8);
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
        }
    }
}).export(module);
