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
    readline = require("readline"),
    parseOptions = utilities.parseOptions,
    getLogger = utilities.getLogger,
    getLocalIP = utilities.getLocalIP,
    options = parseOptions(process.argv),
    procTimeStart = (+new Date()),
    log = getLogger(options.loglevel),
    argPath = (options.argv.remain[2] && path.join(process.cwd(), options.argv.remain[2])),
    localIP = getLocalIP(),
    app,
    phantomProcess,
    timerTimeout,
    rl;

// Catch any exceptions in this process
process.on('uncaughtException', handleError);

// If requesting help documentation
if (options.help || (argPath && argPath.match(/help$/))) {
    return console.log(fs.readFileSync(path.resolve(__dirname, '../lib/assets/help.txt'), 'utf-8'));
}

// Determine the source file, and throw an error if one isn't specified
options.source = (options.source || argPath || false);

if (!options.source) {
    throw new Error('Please specify a source file.  Try --help for more info');
}

// Instantiate YUIBenchmark and initiate the boot-up sequence
app = new YUIBenchmark(options);
app.on('ready', handleReady);
app.on('result', handleResult);
app.on('complete', handleComplete);
app.on('error', handleError);
app.boot();

/**
 * Fired when YUI Benchmark is booted up and ready
 *
 * @private
 */
function handleReady () {
    var port = app.config.port,
        remoteURL = 'http://' + localIP + ':' + port,
        localURL = 'http://127.0.0.1:' + port;

    resetTimeout();

    console.log("Waiting for agents to connect at %s", remoteURL);
    console.log("...also available locally at %s", localURL);

    // If requested, spawn a Phantom.js instance
    if (options.phantom) {
        app.yeti.client.once('agentConnect', function handleAgentConnect (agentName) {
            if (agentName.match(/^PhantomJS/)) {
                app.executeTests();
            }
        });

        spawnPhantom();
    }
    else {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("When ready, press Enter to begin testing.\n", function () {
            rl.close();
            console.log('Executing tests...');
            app.executeTests();
        });
    }
}

/**
 * Executed when a result is recieved
 *
 * @private
 */
function handleResult () {
    resetTimeout();
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
    log.error((err && err.stack) || (err && err.message) || err);
    exit(false);
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
        log.error('Abort');
    }

    log.debug('Process took %s', (seconds < 60 ? seconds + ' seconds' : (seconds / 60).toFixed(2) + ' minutes'));

    if (phantomProcess) {
        phantomProcess.kill();
    }

    process.exit(!successful);
}

/**
 * Spawns a Phantom.js process to execute the test with
 *
 * @private
 */
function spawnPhantom() {
    var scriptPath = path.join(__dirname, '../lib/assets/phantom-load-url.js'),
        port = app.config.port;

    log.debug('Spawning PhantomJS');

    phantomProcess = spawn(scriptPath, ['http://127.0.0.1:' + port]);
    phantomProcess.stdout.on('data', function (data) {
        data = data.toString().trim();
        data.split('\n').forEach(function (line) {
            line = 'Phantom: ' + line;
            if (data.match(/Tempest/)) {
                log.verbose(line);
            }
            else {
                log.debug(line);
            }
        });
    });
}

/**
 * Used to reset the global inactivity timeout
 *
 * @private
 */
function resetTimeout () {
    if (timerTimeout) {
        log.debug('Timeout reset');
        clearTimeout(timerTimeout);
    }

    timerTimeout = setTimeout(timeoutElapsed, app.config.timeout);
}

/**
 * Executes when the timeout period has expired
 *
 * @private
 */
function timeoutElapsed() {
    throw new Error('Inactivity timeout');
}