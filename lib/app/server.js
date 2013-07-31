/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

"use strict";

var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
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
exports.test = function (req, res) {
    var app = req.app,
        taskID = req.params.taskID,
        tasks = app.get('tasks'),
        task = tasks[taskID],
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
    res.end(fs.readFileSync(path.join(__dirname, '../../node_modules/benchmark/benchmark.js'), 'utf8'));
};

/**
 * Serves YUI files
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.yui = function (req, res) {
    var app = req.app,
        taskID = req.params.taskID,
        tasks = app.get('tasks'),
        task = tasks[taskID],
        buildPath = task.buildPath,
        modulePath = req.params[0],
        srcPath = path.join(buildPath, modulePath),
        fileContents = fs.readFileSync(srcPath, 'utf8');

    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fileContents);
};

/**
 * Serves test assets
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.assets = function (req, res) {
    var app = req.app,
        file = req.params.file,
        taskID = req.params.taskID,
        tasks = app.get('tasks'),
        task = tasks[taskID],
        assets = task.assets,
        asset = null;

    assets.forEach(function (a) {
        if (a.name === file) {
            asset = a;
        }
    });

    if (asset) {
        res.writeHead(200, {'Content-Type': asset.mime + '; charset=utf-8'});
        res.end(asset.content);
    }
    else {
        res.writeHead(404);
        res.end();
    }
};

// exports.log = function (req, res) {
//     var message = req.body.message;

//     log.info('Client: ' + message);
//     res.writeHead(200);
//     res.end();
// };
