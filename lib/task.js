/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require('fs'),
    spawn = require('win-spawn'),
    path = require('path'),
    async = require('async'),
    osenv = require('osenv'),
    util = require('./util'),
    options = require('./options'),
    log = require('./log'),
    tmpRoot = options.tmproot || osenv.tmpdir(),
    tasks = [],
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
        taskID = String(tasks.length),
        tests = [],
        sourceBasename = path.basename(options.source),
        meta = {
            id: taskID,
            name: sourceBasename.replace(path.extname(sourceBasename), ''),
            testURL: path.join('/task', taskID, '/index.html'),
            testIterations: config.iterations
        },
        source = parseSource();

    // Turns the refs into an array of tests
    tests = refs.map(function refToTest(ref, i, arr) {
        var sha = util.refTable[ref],
            testID = String(i);

        return {
            id: testID,
            sha: sha,
            ref: ref,
            repository: (ref === "WIP" ? path.join(options.yuipath) : path.join(tmpRoot, 'yui3-' + sha)),
            seedBase: path.join('/task', taskID, 'test', testID, 'yui'),
            moduleURL: path.join('/task', taskID, 'test', testID, 'module', meta.name + '.js')
        }
    });

    this.meta = meta;
    this.tests = tests;
    this.source = source;

    // Add me to this module's array of tasks
    tasks.push(this);
}

/**
 * A convinience utility to log messages specific to this instance
 *
 * @public
 * @param {String} Message to log
 */
Task.prototype.log = function (msg) {
    log.debug("[Test " + this.meta.ref + "]: " + msg);
};

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
}

/**
 * Parses a source JS or HTML file to pull out the content required to construct the test
 * 
 * @private
 * @returns Object containing the HTML and JavaScript code neccesary for the test
 */
function parseSource() {
    var html = null,
        javascript = null,
        bodyRegex = /<body\s*[^>]*>([\S\s]*?)<\/body>/i,
        scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        appletRegex = /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
        source = {
            html: {
                body: '',
            },
            javascript: ''
        };

    // If the source file is an HTML document
    if (path.extname(options.source) === '.html') {
        html = fs.readFileSync(options.source, 'utf8');
        source.html.body = html.match(bodyRegex)[1].replace(scriptRegex, '').replace(appletRegex, '').trim();
        
        javascript = fs.readFileSync(options.source.replace('html', 'js'), 'utf8');
    }
    else {
        javascript = fs.readFileSync(options.source, 'utf8');
    }

    source.javascript = javascript;

    return source;
}

exports.create = Task;
exports.tasks = tasks;
