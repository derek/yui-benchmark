/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var useragent = require('useragent'),
    fs = require('fs'),
    util = require('./util'),
    options = require('./opts'),
    Task = require('./task');

exports.task = function (req, res) {
    var taskID = req.params.taskID,
        task = Task.findTaskById(taskID),
        seedBase = task.seedBase,
        templateHTML = util.templateHTML,
        testHTML = fs.readFileSync(options.source, 'utf8'),
        agent = useragent.parse(req.headers['user-agent']),
        html = templateHTML.replace('{{seedBase}}', seedBase).replace('{{body}}', testHTML).replace('{{taskID}}', taskID);

    console.log("Benchmarking: " + task.ref + " with " + agent);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};
