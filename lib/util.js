/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require("path"),
    Task = require("./task"),
    tasks = Task.tasks;

/**
 * A utility to lookup tasks given a task ID
 * 
 * @public
 * @param {Number} An ID referencing a task
 * @returns The Task instance whose ID matches the argument
 */
exports.findTaskById = function (taskID) {
    return tasks.filter(function (task, i, arr) {
        return (task.meta.id == taskID);
    }).shift();
}

exports.yuiBenchPath = path.join(__dirname, '../');
exports.refTable = {};
exports.shaTable = {};
