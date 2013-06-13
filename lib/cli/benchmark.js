/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var path = require("path"),
    nopt = require('nopt'),
    spawn = require('win-spawn'),
    parser = require('../app/parser'),
    YUIBenchmark = require('../app/yui-benchmark'),
    log = require('../util/log'),
    parseOptions = require('../util/misc').parseOptions,
    options = parseOptions(process.argv),
    procTimeStart = (+new Date()),
    app, phantomProcess, timerTimeout;

if (!options.source) {
    throw new Error('No source file found. Please specify --source.');
}

/**
 * Executed upon completion of all tests
 *
 * @private
 */
function handleComplete (results) {
    var output;

    if (options.pretty) {
        output = parser.prettify(results);
    }
    else {
        output = JSON.stringify(results, null, 4);
    }

    process.stdout.write(output);

    /* Delay termination to allow the browser to return to Yeti's wait page */
    setTimeout(exit, 200, true);
}

/**
 * Handles errors
 *
 * @private
 */
function handleError (err) {
    log.error(err);
    exit(false);
}

/**
 * Spawns a Phantom.js process to execute the test with
 *
 * @private
 */
function spawnPhantom() {
    var scriptPath = path.join(__dirname, '../../scripts/load_url.js'),
        port = app.config.port;

    log.info("Executing tasks with PhantomJS");

    phantomProcess = spawn(scriptPath, ['http://127.0.0.1:' + port]);
}

/**
 * Used to reset the global inactivity timeout
 *
 * @private
 */
function resetTimeout () {

    if (timerTimeout) {
        log.debug("Reset timeout timer");
        clearTimeout(timerTimeout);
    }

    timerTimeout = setTimeout(log.error, app.config.timeout, "Inactivity timeout");
}

/**
 * Cleans up and exits this process
 *
 * @private
 */
function exit (successful) {
    var procTimeEnd = +new Date(),
        seconds = ((procTimeEnd - procTimeStart) / 1000).toFixed(0);

    if (!successful) {
        log.error('Exiting');
    }
    else {
        log.info('Exiting');
    }

    log.debug('Process took ' + (seconds < 60 ? seconds + ' seconds' : (seconds / 60).toFixed(2) + ' minutes'));

    if (phantomProcess) {
        phantomProcess.kill();
    }

    process.exit(!successful);
}

app = new YUIBenchmark(options);

app.on('error', handleError);
app.on('ready', resetTimeout);
app.on('result', resetTimeout);
app.on('complete', handleComplete);

if (options.phantomjs) {
    app.on('ready', spawnPhantom);
}

app.boot();
