/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require('fs'),
    spawn = require('win-spawn'),
    osenv = require('osenv'),
    options = require('./opts'),
    util = require('./util'),
    tmpRoot = osenv.tmpdir(),
    tasks = [];

if (!fs.existsSync(tmpRoot)) {
	if (!fs.mkdirSync(tmpRoot)){
		throw new Error("Error creating tmp dir");
	}
}

function Task (config) {
	var dir;

	if (config.ref === "HEAD") {
		dir = options.yuipath + "/";
	}
	else {
		dir = tmpRoot + 'yui3-' + config.ref + "/";
	}

	this.id = config.ref;
	this.ref = config.ref;
	this.dir = dir;
	this.results = null;
	this.testUrl = '/task/' + this.id + '/';
	this.seedBase = '/yui3/' + this.id + '/';

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

	if (!fs.existsSync(self.dir)) {
		fs.mkdirSync(self.dir);
		self.log("Made dir " + self.dir);
	}

	if (!fs.existsSync(self.dir + "/build/yui/yui-min.js")) {
		self.log("Fetching yui3@" + self.ref);
		child = spawn(script, args, {cwd: self.dir});
		child.stdout.setEncoding('utf8');
		console.log(script, args);
		// child.stdout.on('data', function(data) { self.log(data); });
		child.on('exit', function (error, stdout, stderr) {
			self.log("Done. Ready!");
			callback();
		});
	}
	else {
        self.log("Seed found. Ready!");
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