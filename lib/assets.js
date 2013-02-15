var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
    util = require("./util");

exports.index = function (req, res) {
    var yuiBenchPath = util.yuiBenchPath;
    res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + req.url, 'utf8'));
};

exports.benchmark = function (req, res) {
    var yuiBenchPath = util.yuiBenchPath;
    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

exports.yui = function (req, res) {
    var taskID = req.params.taskID,
        task = global.tasks[taskID],
        srcPath = task.dir + req.params[0];
        
    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fs.readFileSync(srcPath, 'utf8'));
};