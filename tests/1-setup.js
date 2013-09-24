/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var fs = require('fs'),
	path = require('path'),
	seedPath;

if (process.env.YUI3_PATH === undefined) {
	throw new Error('Please set the $YUI3_PATH env variable, which should point to your YUI3 repo');
}

seedPath = path.resolve(process.env.YUI3_PATH, 'build/yui/yui.js');

if (!fs.existsSync(seedPath)) {
	throw new Error('Unable to find the YUI seed at ' + seedPath);
}