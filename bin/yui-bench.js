#!/usr/bin/env node

/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

// Import required modules
var path = require("path"),
    fs = require("fs"),
    options = require("../lib/opts");
    
// Make sure some important files exist
if (!options.yuipath || !fs.existsSync(path.join(options.yuipath, 'build/yui/yui.js'))) {
    console.log("yui.js not found. Check --yuipath");
    return false;
}

if (!options.source || !fs.existsSync(path.join(options.source))) {
    console.log("source not found. Check --source");
    return false;
}

require('../lib/app.js')();