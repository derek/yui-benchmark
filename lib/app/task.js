/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require('fs'),
    spawn = require('win-spawn'),
    path = require('path'),
    async = require('async'),
    taskCount = 0,
    testCount = 0;

/**
 * A "Task" is an individual URL fed to Yeti, so an instance of this object
 * stores all the information needed to construct that page.
 *
 * @public
 * @param {Config} Configuration data for this instance
 */
function Task (config) {
    var refs = config.refs,
        taskID = String(taskCount),
        sourceBasename = path.basename(config.source),
        source = parseSource(config.source),
        tests = [],
        tmproot = config.tmproot,
        yuipath = config.yuipath,
        refTable = config.refTable,
        meta;

    meta = {
        id: taskID,
        name: sourceBasename.replace(path.extname(sourceBasename), ''),
        testURL: path.join('/task', taskID, '/index.html'),
        testIterations: config.iterations
    };

    /* Turns the refs into an array of tests */
    tests = refs.map(function refToTest(ref, i, arr) {
        var sha = refTable[ref],
            testID = String(i),
            repositoryPath = (ref === "WIP" ? path.join(yuipath) : path.join(tmproot, 'yui3-' + sha)),
            seedBase = path.join('/task', taskID, 'test', testID, 'yui'),
            moduleURL = path.join('/task', taskID, 'test', testID, 'module', meta.name + '.js');

        return {
            id: testID,
            sha: sha,
            ref: ref,
            repository: repositoryPath,
            seedBase: seedBase,
            moduleURL: moduleURL
        };
    });

    this.meta = meta;
    this.tests = tests;
    this.source = source;

    taskCount++;
}

/**
 * A convinience utility to log messages specific to this instance
 *
 * @public
 * @param {String} Message to log
 */
// Task.prototype.log = function (msg) {
//     log.debug("[Test " + this.meta.ref + "]: " + msg);
// };

/**
 * A utility to lookup tests given an ID
 *
 * @public
 * @param {Number} An ID referencing a test
 * @returns The Task instance whose ID matches the argument
 */
Task.prototype.findTestById = function (testID) {
    return this.tests.filter(function (test, i, arr) {
        return (test.id == testID);
    }).shift();
};

/**
 * Parses a source JS or HTML file to pull out the content required to construct the test
 *
 * @private
 * @returns Object containing the HTML and JavaScript code neccesary for the test
 */
function parseSource(sourcePath) {
    var html = null,
        javascript = null,
        bodyRegex = /<body\s*[^>]*>([\S\s]*?)<\/body>/i,
        scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        appletRegex = /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
        source = {
            html: {
                body: ''
            },
            javascript: ''
        };

    /* If the source file is an HTML document */
    if (path.extname(sourcePath) === '.html') {
        html = fs.readFileSync(sourcePath, 'utf8');
        javascript = fs.readFileSync(sourcePath.replace('html', 'js'), 'utf8');

        source.html.body = html.match(bodyRegex)[1].replace(scriptRegex, '').replace(appletRegex, '').trim();
        source.javascript = javascript;
    }
    else {
        javascript = fs.readFileSync(sourcePath, 'utf8');

        source.html.body = '';
        source.javascript = javascript;
    }

    return source;
}

exports.create = Task;
