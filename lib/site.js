/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
    useragent = require('useragent'),
    util = require('./util'),
    Task = require('./task'),
    log = require('./log'),
    options = require('./options'),
    yuiBenchPath = util.yuiBenchPath,
    templateHTML = util.templateHTML,
    testHTML;

if (true) {
    testHTML = "<script>" + fs.readFileSync(options.source, 'utf8') + "</script>";
}
else {
    testHTML = fs.readFileSync(options.source, 'utf8');
}

exports.index = function (req, res) {
    res.writeHead(302, { 'Location': '/yeti/' });
    res.end();
};

exports.task = function (req, res) {
    var taskID = req.params.taskID,
        task = Task.findTaskById(taskID),
        seedBase = task.meta.seedBase,
        agent = (useragent.parse(req.headers['user-agent'])).toString().split(' ')[0],
        html = templateHTML
                .replace('{{body}}', testHTML)
                .replace('{{head}}', '<script src="/yeti/public/inject.js"></script>')
                .replace(/\{\{seedBase\}\}/g, seedBase)
                .replace('{{taskID}}', taskID)
                .replace('{{ref}}', task.meta.ref)
                .replace('{{css}}', '');

    log.info("Benchmarking: " + task.meta.ref + " with " + agent);

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

exports.asset = function (req, res) {
    res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + req.url, 'utf8'));
};

exports.benchmarkjs = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

exports.yui = function (req, res) {
    var task = Task.findTaskById(req.params.taskID),
        srcPath = path.join((task ? task.meta.repository : options.yuipath), req.params[0]);
        
    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fs.readFileSync(srcPath, 'utf8'));
};

exports.results = function (req, res) {
    var seedBase = path.join('/', 'yui3', 'HEAD'), // TODO : seedBase should pull from local dev branch
        html = util.templateHTML
                .replace('{{body}}', util.viewerHTML)
                .replace('{{head}}', '')
                .replace(/\{\{seedBase\}\}/g, seedBase)
                .replace('{{taskID}}', '')
                .replace('{{ref}}', '')
                .replace('{{css}}', '#chart {height:85%;width:95%;}');

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

exports.resultsData = function (req, res) {
    var tasks = Task.tasks,
        resultsByRef = {},
        out = {
            "meta": {},
            "data": []
        },
        data,
        ref,
        set,
        results = [];

    if (options.datapath) {
        data = require(tasks[0].meta.outputPath);
        data.results.forEach(function (result) {
            results.push(result);
        });
    }

    tasks.forEach(function (task) {
        task.results.forEach(function (result) {
            results.push(result);
        });
    });
    
    out.meta.component = results[0].component;
    out.meta.name = results[0].name;

    results.forEach(function (result) {
        out.data.push({
            ref: result.ref.substring(0, 10),
            UA: result.UA,
            value: result.value
        });
    });

    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end('var chart = ' + JSON.stringify(out, null, 4));
};