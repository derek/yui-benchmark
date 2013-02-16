/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var util = require('./util'),
    Task = require('./task');

exports.index = function (req, res) {
    var html = util.templateHTML.replace('{{body}}', util.viewerHTML).replace(/\{\{seedBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};

exports.data = function (req, res) {
    var data,
        tasks = Task.tasks,
        resultsByRef = {},
        out = {
            "meta": {
                "component": null,
                "name": null
            },
            "data": []
        };

    tasks.forEach(function (task) {
        if (!resultsByRef[task.ref]) {
            resultsByRef[task.ref] = [];
        }
        
        resultsByRef[task.ref].push(task.result);
    });

    out.meta.component = tasks[0].result.component;
    out.meta.name = tasks[0].result.name;

    for (var ref in resultsByRef) {
        data = {};
        data.category = ref.substring(0, 6);
        resultsByRef[ref].forEach(function (set) {
            data[set.UA] = set.value;
        });

        out.data.push(data);
    }
    
    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });

    res.end('var chart = ' + JSON.stringify(out, null, 4));
};