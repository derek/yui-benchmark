/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

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

    var ref = config.ref,
        sha = config.sha,
        taskID = String(taskCount),
        yuipath = config.yuipath,
        refTable = config.refTable,
        test = config.test;

    this.meta = {
        id: taskID,
        name: test.name
    };

    this.buildPath = (ref === "WIP" ? path.join(yuipath, 'build') : path.join(yuipath, '.builds', sha)),
    this.ref = ref;
    this.sha = sha;
    this.html = test.html;
    this.testURL = path.join('/task', taskID, '/index.html');

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
        },
        jsPath;

    /* If the source file is an HTML document */
    if (path.extname(sourcePath) === '.html') {
        html = fs.readFileSync(sourcePath, 'utf8');
        source.html.body = html.match(bodyRegex)[1].replace(scriptRegex, '').replace(appletRegex, '').trim();

        jsPath = sourcePath.replace('html', 'js');
        if (fs.existsSync(jsPath)) {
            javascript = fs.readFileSync(sourcePath.replace('html', 'js'), 'utf8');
            source.javascript = javascript;
        }
    }
    else {
        javascript = fs.readFileSync(sourcePath, 'utf8');

        source.html.body = '';
        source.javascript = javascript;
    }

    return source;
}

exports.create = Task;
