#!/usr/bin/env node

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint latedef:false */
'use strict';

var path = require('path'),
    spawn = require('win-spawn'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    parser = require('../lib/app/parser'),
    YUIBenchmark = require('../lib/app/yui-benchmark'),
    utilities = require('../lib/utilities'),
    parseOptions = utilities.parseOptions,
    getLogger = utilities.getLogger,
    options = parseOptions(process.argv),
    procTimeStart = (+new Date()),
    log = getLogger(options.loglevel),
    argPath = (options.argv.remain[2] && path.join(process.cwd(), options.argv.remain[2])),
    app,
    phantomProcess,
    timerTimeout;

if (options.help || (argPath && argPath.match(/help$/))) {
    console.log('Please see README.md for help.');
    return;
}

process.on('uncaughtException', handleError);

options.source = (options.source || argPath || false);

if (!options.source) {
    return log.error('Please specify a source file.');
}

app = new YUIBenchmark(options);

app.on('error', handleError);
app.on('ready', resetTimeout);
app.on('result', resetTimeout);
app.on('complete', handleComplete);

if (options.phantom) {
    app.on('ready', spawnPhantom);
}

app.boot();

/**
 * Cleans up and exits this process
 *
 * @private
 */
function exit (successful) {
    var procTimeEnd = +new Date(),
        seconds = ((procTimeEnd - procTimeStart) / 1000).toFixed(0);

    if (!successful) {
        log.error('Abort');
    }

    log.debug('Process took %s', (seconds < 60 ? seconds + ' seconds' : (seconds / 60).toFixed(2) + ' minutes'));

    if (phantomProcess) {
        phantomProcess.kill();
    }

    process.exit(!successful);
}

/**
 * Executed upon completion of all tests
 *
 * @private
 */
function handleComplete (results) {
    var rawData = JSON.stringify(results, null, 4),
        pretty = parser.prettify(results);

    if (options.raw) {
        mkdirp.sync(path.dirname(options.raw));
        fs.writeFileSync(options.raw, rawData);
        log.info('Wrote to %s', options.raw);
    }

    process.stdout.write(pretty);

    // Delay termination to allow the browser to return to Yeti's wait page
    setTimeout(exit, 500, true);
}

/**
 * Handles errors
 *
 * @private
 */
function handleError (err) {
    log.error(err.stack || err.message || err);
    exit(false);
}

/**
 * Spawns a Phantom.js process to execute the test with
 *
 * @private
 */
function spawnPhantom() {
    var scriptPath = path.join(__dirname, '../lib/assets/phantom-load-url.js'),
        port = app.config.port;

    log.info('Executing with PhantomJS');

    phantomProcess = spawn(scriptPath, ['http://127.0.0.1:' + port]);
    phantomProcess.stdout.on('data', function (data) {
        data = data.toString().trim();
        data.split('\n').forEach(function (line) {
            if (data.match(/Tempest/)) {
                log.silly(line);
            }
            else {
                log.debug(line);
            }
        });
    });
}

/**
 * Executes when the timeout period has expired
 *
 * @private
 */
function timeoutElapsed() {
    log.error('Inactivity timeout');
    exit(false);
}

/**
 * Used to reset the global inactivity timeout
 *
 * @private
 */
function resetTimeout () {

    if (timerTimeout) {
        log.debug('Reset the timeout timer');
        clearTimeout(timerTimeout);
    }

    timerTimeout = setTimeout(timeoutElapsed, app.config.timeout);
}
