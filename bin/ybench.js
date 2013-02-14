#!/usr/bin/env node

// Import required modules
var path = require("path"),
	nopt = require("nopt"),
	yeti = require("yeti"),
	fs = require("fs"),
    pack = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')),
    version = pack.version,
    options = nopt({
		"source" : path, 
		"yuipath" : path, 
		"output" : path
	}, {}, process.argv, 2),
	tasks = [],
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

// Develop the task list

if (options.v340) {
	tasks.push('3.4.0');
}

if (options.v350) {
	tasks.push('3.5.0');
}

if (options.v360) {
	tasks.push('3.6.0');
}

if (options.v370) {
	tasks.push('3.7.0');
}

if (options.v380) {
	tasks.push('3.8.0');
}

tasks.push('yui3');

console.log('\nTask list:', tasks, '\n');

// This will be cleaned up later
global.tasks = tasks;
global.port = options.port || 3000;
global.source = options.source;
global.yuipath = options.yuipath;
global.outputPath = options.output;
global.phantomjs = options.phantomjs;
global.ybenchpath = path.join(__dirname, '../');
global.results = [];

require('../lib/app.js')();
