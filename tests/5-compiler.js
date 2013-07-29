/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint es5: true*/ // complains about Vows' 'export' method
"use strict";

var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    crypto = require('crypto'),
    compile = require('../lib/app/compiler'),
    srcConfig1 = fs.readFileSync(path.join(__dirname, 'assets/5/in/config-1.js')),
    srcConfig2 = fs.readFileSync(path.join(__dirname, 'assets/5/in/config-2.js')),
    srcConfig3 = fs.readFileSync(path.join(__dirname, 'assets/5/in/config-3.js')),
    perfSuiteSrc = fs.readFileSync(path.join(__dirname, '../lib/assets/perf-suite.js')),
    context = {suite: null},
    assetPath = path.join(__dirname, './assets/5/in/'),
    suite1, suite2, suite3;

    // Useful to hash long strings (HTML docs) because if they fail, Vows' diff of expected/actual takes forevs to generate
    function md5(str) {
        return crypto.createHash('md5').update(str).digest("hex");
    }

    // Turn the config string into an object
    vm.runInNewContext(perfSuiteSrc + srcConfig1, context);
    suite1 = context.suite.exportConfig();

    // Turn the config string into an object
    vm.runInNewContext(perfSuiteSrc + srcConfig2, context);
    suite2 = context.suite.exportConfig();

    // Turn the config string into an object
    vm.runInNewContext(perfSuiteSrc + srcConfig3, context);
    suite3 = context.suite.exportConfig();

vows.describe('compiler').addBatch({
    'suite 01': {
        topic: compile(suite1, assetPath),
        'should generate the correct suite name': function (suite) {
            assert.equal('test-suite-01.html', suite.name);
        },
        'and the generated HTML': {
            topic: function (suite) {
                this.suite = suite;
                fs.readFile('./tests/assets/5/out/test-suite-01.html', 'utf-8', this.callback)
            },
            'should match': function (html) {
                var expected = md5(this.suite.html),
                    actual = md5(html);

                assert.equal(expected, actual);
            }
        },
        'and the assets': {
            topic: function (topic) {
                return topic.assets;
            },
            'should have a length of 1': function (assets) {
                assert.equal(1, assets.length);
            },
            'and the content': {
                topic: function (topic) {
                    this.asset = topic[0];
                    fs.readFile('./tests/assets/5/out/assets/foo.html', 'utf-8', this.callback);
                },
                'should match': function (content) {
                    var expected = md5(this.asset.content),
                        actual = md5(content);

                    assert.equal(expected, actual);
                }
            },
            'and the mime should match': function (assets) {
                assert.equal(assets[0].mime, 'text/html');
            },
            'and the name should match': function (assets) {
                assert.equal(assets[0].name, 'foo.html');
            }
        }
    },
    'suite 02': {
        topic: compile(suite2, assetPath),
        'should generate the correct name': function (suite) {
            assert.equal('test-suite-02.html', suite.name);
        },
        'and should assemble the assets': function (suite) {
            assert.equal(0, suite.assets.length);
        },
        'and the generated HTML': {
            topic: function (suite) {
                this.suite = suite;
                fs.readFile('./tests/assets/5/out/test-suite-02.html', 'utf-8', this.callback)
            },
            'should match': function (html) {
                var expected = md5(this.suite.html),
                    actual = md5(html);

                assert.equal(expected, actual);
            }
        }
    },
    'suite 03': {
        topic: compile(suite3, assetPath),
        'should generate the correct name': function (suite) {
            assert.equal('test-suite-03.html', suite.name);
        },
        'and the generated HTML': {
            topic: function (suite) {
                this.suite = suite;
                fs.readFile('./tests/assets/5/out/test-suite-03.html', 'utf-8', this.callback)
            },
            'should match': function (html) {
                var expected = (this.suite.html),
                    actual = (html);

                assert.equal(expected, actual);
            }
        }
    }
}).export(module);
