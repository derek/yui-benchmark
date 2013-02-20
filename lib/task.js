/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require('fs'),
    spawn = require('win-spawn'),
    path = require('path'),
    osenv = require('osenv'),
    util = require('./util'),
    options = require('./options'),
    tmpRoot = osenv.tmpdir(),
    tasks = [];

if (!fs.existsSync(tmpRoot)) {
    if (!fs.mkdirSync(tmpRoot)) {
        throw new Error("Unable to create tmp dir (" + tmpRoot + ")");
    }
}

function Task (config) {
    var dir;

    if (config.ref === "HEAD") {
        dir = path.join(options.yuipath);
    }
    else {
        dir = path.join(tmpRoot, 'yui3-' + config.ref);
    }

    this.id = config.ref;
    this.ref = config.ref;
    this.dir = dir;
    this.testUrl = path.join('/', 'task', this.id);
    this.seedBase = path.join('/', 'yui3', this.id);
    this.result = null;
    this.rawData = null;
    this.UA = null;
    this.date = null;
    this.source = config.source;

    tasks.push(this);
}

Task.prototype.log = function (msg) {
    console.log("[Task " + this.ref + "]: " + msg);
};

Task.prototype.init = function (callback) {

    var self = this,
        yuiBenchPath = util.yuiBenchPath,
        yuipath = options.yuipath,
        script = yuiBenchPath + 'scripts/git-thing.sh',
        args = ['file://' + yuipath, self.ref],
        child;

    if (!fs.existsSync(self.dir + "/build/yui/yui-min.js")) {
        self.log("Unable to find seed");

        if (!fs.existsSync(self.dir)) {
            fs.mkdirSync(self.dir);
            self.log("Made dir " + self.dir);
        }

        self.log("Fetching yui3@" + self.ref);
        child = spawn(script, args, {cwd: self.dir});
        child.stdout.setEncoding('utf8');
        // child.stdout.on('data', function(data) { self.log(data); });
        // child.stderr.on('data', function(data) { self.log(data); });
        child.on('exit', function (error, stdout, stderr) {
            self.log("Done. Ready!");
            callback();
        });
    }
    else {
        self.log("Seed detected. Ready!");
        callback();
    }
};

function findTaskById(id) {
    return tasks.filter(function (task) {
        return (task.id == id);
    })[0];
}

exports.create = Task;
exports.tasks = tasks;
exports.findTaskById = findTaskById;