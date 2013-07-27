#!/usr/bin/env node

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var nopt = require("nopt"),
    path = require("path"),
    fs = require("fs"),
    mkdirp = require('mkdirp'),
    compile = require('../app/compiler'),
    vm = require('vm'),
    options = nopt({
        "template" : path,
        "watch" : Boolean
    }, {
        "t" : "--template",
        "w" : "--watch"
    }, process.argv, 2),
    srcConfig = path.join(process.cwd(), options.argv.remain[0]),
    targetDir = (options.argv.remain[1] || process.cwd());

function writeSuite (suite, targetDir) {
    var outPath = path.join(targetDir, suite.name),
        html = suite.html;

    // Write the HTML to the filesystem, and log the path
    fs.writeFile(outPath, html, function () {
        console.log(outPath);
    });

    // If this suite has assets, copy them to the filesystem
    if (suite.assets.length > 0) {
        mkdirp.sync(path.join(targetDir, 'assets'));
        suite.assets.forEach(function (asset) {
            var assetOutPath = path.join(targetDir, 'assets', asset.name);

            fs.writeFileSync(assetOutPath, asset.content);
        });
    }
}

function processConfig (srcConfig, targetDir) {
    var srcDir = path.dirname(srcConfig),
        context = {suite: null},
        suites;
    // Turn the config string into an object
    vm.runInNewContext(fs.readFileSync('../templates/perf-suite.js') + fs.readFileSync(srcConfig), context);
    suites = context.module.exports;

    // If it's just a single suite, turn it into an array of suites
    if (typeof suites.push !== 'function') {
        suites = [suites];
    }

    // Create the target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
        mkdirp.sync(targetDir);
    }

    // Write out each suite to it's own file
    suites.forEach(function (suite) {
        if (suite.html) {
            if (fs.existsSync(path.join(srcDir, suite.html))) {
                suite.html = fs.readFileSync(path.join(srcDir, suite.html), 'utf-8');
            }
        }

        suite = compile(suite, srcDir);
        writeSuite(suite, targetDir);
    });
}

if (options.watch) {
    processConfig(srcConfig, targetDir);
    fs.watch(srcConfig, function () {
        processConfig(srcConfig, targetDir);
    });
}
else {
    processConfig(srcConfig, targetDir);
}
