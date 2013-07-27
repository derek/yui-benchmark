/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

'use strict';

var path = require('path'),
    spawn = require('win-spawn'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    parser = require('../app/parser'),
    YUIBenchmark = require('../app/yui-benchmark'),
    utilities = require('../utilities'),
    parseOptions = utilities.parseOptions,
    getLogger = utilities.getLogger,
    options = parseOptions(process.argv),
    procTimeStart = (+new Date()),
    app, phantomProcess, timerTimeout, log;

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
    var output,
        raw = JSON.stringify(results, null, 4);

    if (options.out) {
        mkdirp.sync(path.dirname(options.out));
        fs.writeFileSync(options.out, raw);
        log.info('Wrote to %s', options.out);
    }

    if (options.pretty) {
        output = parser.prettify(results);
    }
    else {
        output = raw;
    }

    process.stdout.write(output);

    /* Delay termination to allow the browser to return to Yeti's wait page */
    setTimeout(exit, 500, true);
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

    log.info('Executing with PhantomJS');

    phantomProcess = spawn(scriptPath, ['http://127.0.0.1:' + port]);
    phantomProcess.stdout.on('data', function (data) {
        data = data.toString();
        if (options.tempest || !data.match(/Tempest/)) {
            log.debug(data.trim());
        }
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

options.source = (options.source || path.join(process.cwd(), options.argv.remain[2]));

if (!options.source) {
    throw new Error('No source file found. Please specify --source.');
}

log = getLogger(options.loglevel);

process.on('uncaughtException', handleError);

app = new YUIBenchmark(options);

app.on('error', handleError);
app.on('ready', resetTimeout);
app.on('result', resetTimeout);
app.on('complete', handleComplete);

if (options.phantomjs) {
    app.on('ready', spawnPhantom);
}

app.boot();
