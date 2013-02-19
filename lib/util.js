/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require("path"),
    fs = require("fs"),
    options = require("./options"),
    yuiBenchPath = path.join(__dirname, '../'),
    templateHTML = fs.readFileSync(yuiBenchPath + 'assets/template.html', 'utf8'),
    viewerHTML = fs.readFileSync(yuiBenchPath + 'assets/viewer.html', 'utf8');

exports.yuiBenchPath = yuiBenchPath;
exports.templateHTML = templateHTML;
exports.viewerHTML = viewerHTML;
exports.seedBase = "file://" + options.yuipath;