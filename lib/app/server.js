/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
    useragent = require('useragent'),
    taskUtil = require('./task'),
    utilities = require('../utilities'),
    findTaskById = utilities.findTaskById,
    yuiBenchPath = path.join(__dirname, '../../'),
    testHTML,
    log;

/**
 * Sets the logger instance for this module
 *
 * @public
 * @param {Object} A logging instance
 */
exports.setLogger = function(logger) {
    log = logger;
};

/**
 * Serves a redirect to Yeti
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.index = function (req, res) {
    res.writeHead(302, { 'Location': '/yeti/' });
    res.end();
};

/**
 * Serves an HTML document containing the tests for a given task instance
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.task = function (req, res) {
    var app = req.app,
        taskID = req.params.taskID,
        tasks = app.get('tasks'),
        task = findTaskById(tasks, taskID),
        agent = (useragent.parse(req.headers['user-agent'])).toString().split(' ')[0],
        html = task.html;

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

/**
 * Serves benchmark.js
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.benchmarkjs = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

/**
 * Serves unwrapped YUI files
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.bareYUI = function (req, res) {
    var app = req.app,
        yuipath = app.get('yuipath');

    var srcPath = path.join(yuipath, '/build/', req.params[0]),
        fileContents = fs.readFileSync(srcPath, 'utf8');

    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fileContents);
};

exports.log = function (req, res) {
    var message = req.body.message;

    log.info('Client: ' + message);
    res.writeHead(200);
    res.end();
};
