/*
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
    tasks = [];

// A Task instance is what stores all the information neccesary to execute
// a test.  It is unique per (source + ref) combo.
function Task (config) {

    var refs = config.refs,
        taskID = (tasks.length).toString(),
        tests = [],
        meta = {
            id: taskID,
            testURL: path.join('/', 'task', taskID, '/'),
            testSource: config.source,
            testIterations: config.iterations
        };

    refs.forEach(function (ref) {
        var sha = util.refTable[ref],
            testID = (tests.length).toString();

        tests.push({
            id: testID,
            sha: sha,
            ref: ref,
            repository: (ref === "WIP") ? path.join(options.yuipath) : path.join(tmpRoot, 'yui3-' + sha),
            seedBase: path.join('/', 'yui', taskID, testID, ref)
        });
    });

    this.meta = meta;
    this.tests = tests;

    // Add this task to this module's list of tasks
    tasks.push(this);
}

Task.prototype.log = function (msg) {
    log.debug("[Test " + this.meta.ref + "]: " + msg);
};

// A utility to lookup tasks given a task ID
function findTaskById(id) {
    return tasks.filter(function (task) {
        return (task.meta.id == id);
    })[0];
}

exports.create = Task;
exports.tasks = tasks;
exports.findTaskById = findTaskById;