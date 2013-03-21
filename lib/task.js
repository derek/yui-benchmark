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

if (!fs.existsSync(tmpRoot)) {
    if (!fs.mkdirSync(tmpRoot)) {
        throw new Error("Unable to create tmp dir (" + tmpRoot + ")");
    }
}

function Task (config) {
    var id = (tasks.length + 1).toString(),
        meta = {
            id: id,
            sha: config.sha,
            ref: config.ref,
            testID: util.testID, // An identifier of the contents of this test
            repository: (config.ref === "WIP") ? path.join(options.yuipath) : path.join(tmpRoot, 'yui3-' + config.sha),
            seedBase: path.join('/', 'yui3', config.ref),
            testURL: path.join('/', 'task', id, config.ref),
            testSource: config.source,
            testIterations: config.iterations,
            outputPath: ''
        };

    if (options.datapath) {
        meta.outputPath = path.join(options.datapath, meta.testID + '.json')
    }

    this.meta = meta;

    tasks.push(this);
}

Task.prototype.log = function (msg) {
    log.debug("[Task " + this.meta.ref + "]: " + msg);
};

Task.prototype.init = function (callback) {

    var self = this,
        meta = self.meta,
        yuiBenchPath = util.yuiBenchPath,
        yuipath = options.yuipath,
        script = yuiBenchPath + 'scripts/fetch-ref.sh',
        args = ['file://' + yuipath, meta.sha],
        child;

    if (!fs.existsSync(meta.repository + "/build/yui/yui-min.js")) {
        self.log("Unable to find seed");

        if (!fs.existsSync(meta.repository)) {
            fs.mkdirSync(meta.repository);
            self.log("Made dir " + meta.repository);
        }

        async.series([
            function(next){ exec('git init', meta.repository, next); },
            function(next){ exec('git remote add origin file://' + yuipath, meta.repository, next); },
            function(next){ exec('git fetch origin', meta.repository, next); },
            function(next){ exec('yogi checkout ' + meta.sha, meta.repository, next); },
        ], function(err, results){
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
        return (task.meta.id == id);
    })[0];
}

function exec(args, cwd, cb) {
    var args = args.split(' '),
        cmd = args.shift(),
        child;

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) { process.stdout.write(data); });
    // child.stderr.on('data', function(data) { self.log(data); });
    child.on('exit', function (error, stdout, stderr) {
        cb();
    });
}

exports.create = Task;
exports.tasks = tasks;
exports.findTaskById = findTaskById;