/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    yeti = require('yeti'),
    path = require('path'),
    async = require('async'),
    spawn = require('win-spawn'),
    exec = require("child_process").exec,
    express = require('express'),
    osenv = require('osenv'),
    util = require('./util'),
    Task = require('./task'),
    options = require('./options'),
    log = require('./log'),
    parser = require('./parser'),
    site = require('../lib/site'),

    testURLs = [],
    procResults = [], // Results of the performance tests executed by this process
    batchCount = 0,
    batchesComplete = 0,
    phantomProcess,
    server,
    timerTimeout;

/**
 * Kicks off the app
 *
 * @public
 */
module.exports = function main () {

    /* A series of function to execute to boot up the app */
    var bootSeries = [
        findYUI,
        findSource,
        prepSHAs,
        prepRepos,
        createTasks,
        gatherTestURLs,
        startExpress,
        startYeti
    ];

    /* If we want to test with phantomjs */
    if (options.phantomjs) {
        bootSeries.push(startPhantom);
    }

    async.series(bootSeries);
};

/**
 * Finds the absolute path to the root of the local YUI repo we should be in
 * 
 * @private
 * @param {Function} Callback to execute upon completion
 */
function findYUI (callback) {
    exec('git rev-parse --show-toplevel', {
        cwd: options.yuipath
    }, function(err, stdout) {
        var yuipath = stdout.trim();
        if (!fs.existsSync(path.join(yuipath, '/src/yui/js/yui.js'))) {
            throw new Error("yui.js not found. Check --yuipath option");
        }
        options.yuipath = yuipath;
        callback();
    });
}

/**
 * Finds the absolute path to the source test file
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function findSource (callback) {
    if (!options.source) {
        options.source = path.join(process.cwd(), options.argv.remain[0]);
    }

    if (options.source === undefined || !fs.existsSync(path.join(options.source))) {
        throw new Error("source not found. Check --source option");
    }

    callback();
}

/**
 * Converts refs to SHAs
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function prepSHAs (callback) {
    async.each(options.refs, function (ref, next) {
        exec('git rev-parse ' + ref, {
            cwd: options.yuipath
        }, function(err, stdout) {
            var sha = stdout.trim();
            util.refTable[ref] = sha;
            util.shaTable[sha] = ref;
            next();
        });
    }, function (err) {
        callback();
    });
}

/**
 * Loops through each repo, triggering a fetch/build process
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function prepRepos (callback) {
    async.each(options.refs, prepRepo, callback);
}

/**
 * If neccesary, prepares each repo directory
 *
 * @private
 * @param {String}
 * @param {Function} Callback to execute upon completion
 */
function prepRepo (ref, callback) {
    var repoRoot = (options.tmproot || osenv.tmpdir()),
        yuipath = options.yuipath,
        sha = util.refTable[ref],
        repository = ((ref === "WIP") ? path.join(yuipath) : path.join(repoRoot, 'yui3-' + sha));

    log.debug('Repo: ' + repository);

    if (!fs.existsSync(repository + "/build/yui/yui-min.js")) {
        log.info(ref + ": Unable to find seed");

        if (!fs.existsSync(repository)) {
            log.debug('Making directory');
            fs.mkdirSync(repository);
            log.info(ref + ": Made dir " + repository);
        }

        log.debug('Cloning...');
        async.series([
            function(next){ myExec('git init', repository, next); },
            function(next){ myExec('git remote add origin file://' + yuipath, repository, next); },
            function(next){ log.info(ref + ': Fetching and building...');myExec('git fetch origin', repository, next); },
            function(next){ myExec('yogi checkout ' + sha, repository, next); },
        ], function(err, results){
            // TODO: check to see if seed is available
            callback();
        });
    }
    else {
        log.info(ref + ": Seed detected. Ready!");
        callback();
    }
}

/**
 * Creates each Task object. 
 * Tasks represent a collection of tests and an individual URL given to Yeti.
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function createTasks (callback) {

    if (options.multiseed) {
        new Task.create({
            refs: options.refs, 
            source: options.source, 
            iterations: options.iterations
        });
        callback();
    }
    else {
        async.each(options.refs, function (ref, next) {
            new Task.create({
                refs: [ref], 
                source: options.source, 
                iterations: options.iterations
            });
            next();
        }, callback);
    }
}

/**
 * Collects an array of URLs containing tests
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function gatherTestURLs (callback) {
    testURLs = Task.tasks.map(function (task, i, arr) {
        return task.meta.testURL;
    });
    callback();
}

/**
 * Fires up the Express server
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function startExpress (callback) {
    var app = express();

    server = app.listen(options.port);

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);
    app.get('/task/:taskID/index.html', site.task);
    app.get('/task/:taskID/test/:testID/yui/*', site.wrappedYUI);
    app.get('/task/:taskID/test/:testID/module/*', site.wrappedTest);
    app.get('/yui/build/*', site.bareYUI);
    app.get('/benchmark.js', site.benchmarkjs);
    app.get('/yui-benchmark.js', site.yuibenchmarkjs);
    // app.get('/assets/*', site.asset);
    // app.get('/results/', site.results);
    // app.get('/results/data.js', site.resultsData);

    callback();
}

/**
 * Fires up Yeti
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function startYeti (callback) {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + options.port + "/yeti/");
    yetiClient.connect(function yetiConnect() { /* Nothing */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    log.info('Listening at http://127.0.0.1:' + options.port);

    callback();
}

/**
 * Spawns a Phantom.js process
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
function startPhantom (callback) {
    log.info("Executing tasks with PhantomJS");

    phantomProcess = spawn(path.join(util.yuiBenchPath, 'scripts/load_url.js'), ['http://127.0.0.1:' + options.port], {
        cwd: this.dir
    });

    timerTimeout = setTimeout(exit, options.timeout);

    callback();
}


/**
 * Yeti listener to handle browser connects
 *
 * @private
 * @param {String} User agent
 */
function handleAgentConnect (agentName) {
    log.debug("Agent connect: " + agentName);

    var batch = this.createBatch({
        useProxy: false,
        tests: testURLs,
        timeout: 4200
    });

    batch.on('agentResult', handleResult);
    batch.on('complete', handleBatchComplete);
    batch.on('agentScriptError', handleBatchScriptError);

    batchCount++;
}

/**
 * Yeti listener to handle JavaScript errors within the browser
 *
 * @private
 * @param {String} User agent
 */
function handleBatchScriptError (agentName, details) {
    log.error("Agent error!");
    log.error(agentName);
    log.error(details);

    exit();
}

/**
 * Yeti listener that handles results
 *
 * @private
 * @param {String} User agent
 * @param {Object} results
 */
function handleResult (agentName, results) {
    log.info("Got result for task " + results[0].taskID + " from " + agentName)
    results.forEach(function handleEachResult(result) {
        var taskID = result.taskID,
            task = util.findTaskById(taskID);

        // Don't need this.  Too much data
        delete result.stats.sample;

        result.UA = agentName;
        result.date = new Date().getTime();
        result.task = task.meta;

        procResults.push(result);
    });
}

/**
 * Yeti listener that handles batch completions
 *
 * @private
 * @param {String} User agent
 */
function handleBatchComplete (agentName) {
    log.debug('Batch complete - ' + agentName);

    if (++batchesComplete === batchCount) {
        outputResults();

        /* Delay termination to allow the browser to return to Yeti's wait page */
        setTimeout(exit, 200);
    }
}

/**
 * Parses and outputs the results
 *
 * @private
 */
function outputResults () {
    var tasks = Task.tasks;

    if (options.raw) {
        console.log(parser.getRaw(procResults));
    }

    if (options.pretty) {
        console.log(parser.getPretty(procResults));
    }
}

/**
 * Cleans up and exits this process
 *
 * @private
 */
function exit () {
    log.info('Exiting');
    if (phantomProcess) {
        phantomProcess.kill();
    }
    process.exit();
}

/**
 * A simple utility to execute commands that makes prepRepo() a litter cleaner
 *
 * @private
 * @param {Object} Arguments
 * @param {String} Path pointing to the current working directory to execute this command in
 * @param {Function} Callback to execute upon completion
 */
function myExec(args, cwd, callback) {
    // log.debug('myExec args: ' + args);
    // log.debug('myExec cwd: ' + cwd);

    var args = args.split(' '),
        cmd = args.shift(),
        child;

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) { process.stdout.write(data); });
    // child.stderr.on('data', function(data) { self.log(data); });
    child.on('exit', function (error, stdout, stderr) {
        callback();
    });
}
