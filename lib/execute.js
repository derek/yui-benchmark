/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var useragent = require('useragent'),
    util = require('./util');

exports.task = function (req, res) {
    var taskID = req.params.task,
        task = global.tasks[taskID],
        seedBase = task.seedBase,
        html = util.templateHTML,
        agent = useragent.parse(req.headers['user-agent']);
    
    console.log("Benchmarking: " + task.ref + " with " + agent);

    html = html.replace('{{seedBase}}', seedBase).replace('{{body}}', testHTML).replace('{{taskID}}', taskID);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};
