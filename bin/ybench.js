#!/usr/bin/env node

// Import required modules
var path = require("path"),
	nopt = require("nopt"),
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
if (!fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
	console.log("yui.js not found. Check --yuipath");
	return false;
}
if (!fs.existsSync(path.join(options.source))) {
	console.log("source not found. Check --source");
	return false;
}

// Develop the task list
tasks.push('master');

if (options.v360) {
	tasks.push('3.6.0');
}

if (options.v370) {
	tasks.push('3.7.0');
}

if (options.v380) {
	tasks.push('3.8.0');
}

tasks.push('end');

// Generate the yBench config and execute
config = {
	tasks: tasks,
	port: options.port || 3000,
	source: options.source,
	yuipath: options.yuipath,
	outputPath: options.output,
	phantomjs: options.phantomjs,
	ybenchpath: path.join(__dirname, '../')
};

console.log("Config: ", config);

require('../lib/app.js')(config);
