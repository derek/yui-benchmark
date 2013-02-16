#!/usr/bin/env node

/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

// Import required modules
var path = require("path"),
	nopt = require("nopt"),
	yeti = require("yeti"),
    osenv = require('osenv'),
    Task = require('../lib/task').Task,
	fs = require("fs"),
    pack = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')),
    version = pack.version,
    options = nopt({
		"source" : path, 
		"yuipath" : path, 
		"output" : path
	}, {}, process.argv, 2),
	tasks = {},
	refs = options.ref || [],
	config;

// Make sure some important files exist
if (!options.yuipath || !fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
	console.log("yui.js not found. Check --yuipath");
	return false;
}

if (!options.source || !fs.existsSync(path.join(options.source))) {
	console.log("source not found. Check --source");
	return false;
}

tmpRoot = osenv.tmpdir();

if (!fs.existsSync(tmpRoot)) {
    fs.mkdirSync(tmpRoot);
}

// Normalize it as an array
if (!refs.push) {
	refs = [refs]
}

function getRandomID() {
	return Math.floor((Math.random()*1000000)+1)
}

refs.forEach(function (ref) {
	var id = getRandomID();
	tasks[id] = new Task({ id: id, ref: ref, tmpRoot: tmpRoot});
});

// var id = getRandomID();
// tasks[id] = new Task({ id: id, ref: 'HEAD', tmpRoot: tmpRoot});

// This will be cleaned up later
global.yuiPath = options.yuipath;
global.outputPath = options.output;
global.results = {};
global.tasks = tasks;

require('../lib/app.js')({
	port: options.port || 3000,
	source: options.source,
	phantomjs: options.phantomjs || false
});
