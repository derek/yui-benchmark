var fs = require("fs"),
    mime = require("mime"),
    path = require("path");

exports.benchmark = function (req, res) {
    var yuiBenchPath = global.yuiBenchPath;
    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

exports.json = function (req, res) {
    var yuiBenchPath = global.yuiBenchPath;
    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/JSON2/json2.js', 'utf8'));
};

exports.yui = function (req, res) {
    var srcPath = path.join(yuipath, '../', req.url);

    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fs.readFileSync(srcPath, 'utf8'));
};

exports.index = function (req, res) {
    var yuiBenchPath = global.yuiBenchPath;
    res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + req.url, 'utf8'));
};