/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var path = require("path"),
    osenv = require("osenv"),
    nopt = require("nopt"),
    op = require('./options-parser'),
    Configurator = require('../util/configurator'),
    YUIBenchmark = require('../app/yui-benchmark').YUIBenchmark,
    options = op.parse(process.argv, 2),
    procTimeStart = +new Date(),
    config, yb;

options.tmproot = (options.tmproot || osenv.tmpdir());

config = new Configurator();
config.import(options);

yb = new YUIBenchmark(config.export());

yb.on('complete', function () {
    console.log(this.results);

    /* Delay termination to allow the browser to return to Yeti's wait page */
    setTimeout(function () {
        exit(true);
    }, 200);
});

yb.boot();



/**
 * Cleans up and exits this process
 *
 * @private
 */
function exit (successful) {

    var procTimeEnd = +new Date();

    if (!successful) {
        log.error("Unable to complete batch processing.");
        log.error("\tSource: " + options.source);
        log.error("\tRefs: " + options.refs.join(", "));
    }

    log.info('Exiting');
    log.debug('Process took ' + ((procTimeEnd - procTimeStart) / 1000 / 60).toFixed(2) + " minutes");
    if (phantomProcess) {
        phantomProcess.kill();
    }

    process.exit();
}

