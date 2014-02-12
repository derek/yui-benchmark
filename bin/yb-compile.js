#!/usr/bin/env node

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

'use strict';

var fs = require("fs"),
    mkdirp = require('mkdirp'),
    nopt = require("nopt"),
    path = require("path"),
    vm = require('vm'),
    compile = require('../lib/app/compiler'),
    utilities = require('../lib/utilities'),
    options = nopt({
        "template" : path,
        "watch" : Boolean,
        "loglevel": String,
        "node": Boolean
    }, {
        "t" : "--template",
        "w" : "--watch",
        'debug': ['--loglevel', 'debug']
    }, process.argv, 2),
    getLogger = utilities.getLogger,
    log = getLogger(options.loglevel),
    srcConfig = path.join(process.cwd(), options.argv.remain[0]),
    targetDir = (options.argv.remain[1] || process.cwd());

function writeSuite (suite, targetDir) {
    var outPath = path.join(targetDir, suite.name),
        code = suite.code;

    // Write the HTML to the filesystem, and log the path
    fs.writeFile(outPath, code, function () {
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

function processConfig (srcConfigPath, targetDir) {
    var srcDir = path.dirname(srcConfig),
        context = {suite: null},
        perfSuiteSource = fs.readFileSync(path.join(__dirname, '../lib/assets/perf-suite.js'), 'utf-8'),
        configSource = fs.readFileSync(srcConfigPath, 'utf-8'),
        suite,
        compiled;

    // Turn the config string into an object
    vm.runInNewContext(perfSuiteSource + configSource, context);
    suite = context.suite.exportConfig();

    if (options.node) {
        suite.runner = 'node';
    }

    // Create the target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
        mkdirp.sync(targetDir);
    }

    // Compile the suite
    compiled = compile(suite, srcDir);

    // Log the configuration object
    log.debug('Suite Configuration');
    log.debug(JSON.stringify(suite, null, 4));

    // Write the HTML & assets to the filesystem
    writeSuite(compiled, targetDir);
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
