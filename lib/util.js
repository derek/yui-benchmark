/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require("path"),
    fs = require("fs"),
    crypto = require("crypto"),
    exec = require("child_process").exec,
    options = require("./options"),
    yuiBenchPath = path.join(__dirname, '../'),
    templateHTML = fs.readFileSync(yuiBenchPath + 'assets/template.html', 'utf8'),
    viewerHTML = fs.readFileSync(yuiBenchPath + 'assets/viewer.html', 'utf8'),
    testHTML = fs.readFileSync(options.source, 'utf8'),
    testID = crypto.createHash('sha1').update(testHTML).digest('hex');

exports.yuiBenchPath = yuiBenchPath;
exports.templateHTML = templateHTML;
exports.viewerHTML = viewerHTML;
exports.testHTML = testHTML;
exports.testID = testID;
exports.seedBase = "file://" + options.yuipath;

exports.gitRefToSHA = function(ref, cb) {
    exec('git rev-parse ' + ref, {
        cwd: options.yuipath
    }, function(err, stdout) {
        var sha = stdout.trim();
        cb(err, sha);
    });
};