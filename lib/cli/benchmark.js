/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var path = require("path"),
    nopt = require('nopt'),
    log = require('../util/log'),
    YUIBenchmark = require('../app/yui-benchmark'),
    parseOptions = require('../util/misc').parseOptions,
    options = parseOptions(process.argv),
    procTimeStart = (+new Date()),
    yb, phantomProcess, timerTimeout;

yb = new YUIBenchmark(options);

yb.on('ready', function () {
    resetTimeout();
    if (yb.config.phantomjs) {
        log.info("Executing tasks with PhantomJS");

        phantomProcess = spawn(path.join(config.yuiBenchPath, 'scripts/load_url.js'), ['http://127.0.0.1:' + config.port], {
            cwd: this.dir
        });
    }
});

yb.on('result', function () {
    resetTimeout();
});

yb.on('error', function (err) {
    log.error(err);
    exit(false);
});

yb.on('complete', function () {
    console.log(JSON.stringify(this.results, null, 4));

    /* Delay termination to allow the browser to return to Yeti's wait page */
    setTimeout(function () {
        exit(true);
    }, 200);
});

yb.boot();



/**
 * Used to reset the global inactivity timeout
 *
 */
function resetTimeout () {
    log.debug("Reset timeout timer");

    if (timerTimeout) {
        clearTimeout(timerTimeout);
    }

    timerTimeout = setTimeout(function () {
        log.error("Inactivity timeout");
    }, yb.config.timeout);
};

/**
 * Cleans up and exits this process
 *
 * @private
 */
function exit (successful) {

    var procTimeEnd = +new Date(),
        seconds = ((procTimeEnd - procTimeStart) / 1000).toFixed(0);

    if (!successful) {
        log.error();
    }

    log.info('Exiting');
    log.debug('Process took ' + (seconds < 60 ? seconds + ' seconds' : (seconds / 60).toFixed(2) + ' minutes'));

    if (phantomProcess) {
        phantomProcess.kill();
    }

    process.exit(!successful);
}
