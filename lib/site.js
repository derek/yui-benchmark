/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
	mime = require("mime"),
	path = require("path"),

	execute = require('./execute'),
	util = require('./util'),
	Task = require('./task'),
	options = require('./opts');

exports.index = function (req, res) {
	res.writeHead(302, { 'Location': '/yeti/' });
	res.end();
};

exports.task = function (req, res) {
	var taskID = req.params.taskID, 
		html = execute.task(taskID, req.headers['user-agent']);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};

exports.asset = function (req, res) {
    var yuiBenchPath = util.yuiBenchPath;
    res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + req.url, 'utf8'));
};

exports.assetBenchmarkjs = function (req, res) {
    var yuiBenchPath = util.yuiBenchPath;
    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

exports.assetYui = function (req, res) {
    var task = Task.findTaskById(req.params.taskID),
        srcPath = (task ? task.dir : options.yuipath) + req.params[0];
        
    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fs.readFileSync(srcPath, 'utf8'));
};

exports.results = function (req, res) {
    var seedBase = '/yui3/HEAD/', // TODO : seedBase should pull from local dev branch
        html = util.templateHTML
                .replace('{{body}}', util.viewerHTML)
                .replace(/\{\{seedBase\}\}/g, seedBase);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};

exports.resultsData = function (req, res) {
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

    out.meta.component = tasks[0].result.component;
    out.meta.name = tasks[0].result.name;

    tasks.forEach(function (task) {
        if (!resultsByRef[task.ref]) {
            resultsByRef[task.ref] = [];
        }
        
        resultsByRef[task.ref].push(task.result);
    });

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