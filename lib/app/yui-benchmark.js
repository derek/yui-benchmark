/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var EventEmitter = require('../util/event-emitter'),
    util = require('util'),
    fs = require("fs"),
    yeti = require('yeti'),
    path = require('path'),
    async = require('async'),
    spawn = require('win-spawn'),
    exec = require("child_process").exec,
    express = require('express'),
    task = require('./task'),
    log = require('../log'),
    parser = require('../parser'),
    site = require('./server'),

    testURLs = [],
    procResults = [], // Results of the performance tests executed by this process
    batchCount = 0,
    batchesComplete = 0,
    phantomProcess,
    server,
    timerTimeout,
    options,
    proto;

function YUIBenchmark (config) {
    this.results = [];
    this.config = config;

    this.yuiBenchPath = path.join(__dirname, '../');
    this.refTable = {};
    this.shaTable = {};
}

util.inherits(YUIBenchmark, EventEmitter);

proto = YUIBenchmark.prototype;

module.exports.YUIBenchmark = YUIBenchmark;

/**
 * Kicks off the app
 *
 * @public
 */
proto.boot = function () {
    var self = this;

    /* A series of function to execute to boot up the app */
    var bootSeries = [
        this.findYUI.bind(this),
        this.findSource.bind(this),
        this.prepSHAs.bind(this),
        this.prepRepos.bind(this),
        this.createTasks.bind(this),
        this.gatherTestURLs.bind(this),
        this.startExpress.bind(this),
        this.startYeti.bind(this)
    ];

    /** If we want to test with phantomjs */
    if (this.config.phantomjs) {
        bootSeries.push(this.startPhantom.bind(this));
    }

    async.series(bootSeries, function (err, results) {
        if (err) {
            self.emit('error', err);
        }
        else {
            self.ready();
        }
    });
};

/**
 * Finds the absolute path to the root of the local YUI repo we should be in
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.findYUI = function (callback) {
    var self = this,
        config = self.config,
        error = null,
        result = null;

    exec('git rev-parse --show-toplevel', {cwd:config.yuipath}, function(err, stdout) {
        var yuipath = stdout.trim();
        if (!fs.existsSync(path.join(yuipath, '/src/yui/js/yui.js'))) {
            error = yuipath + "/src/yui/js/yui.js not found.";
        }
        callback(error, result);
    });
};

/**
 * Finds the absolute path to the source test file
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.findSource = function (callback) {
    var self = this,
        config = self.config,
        error = null,
        result = null;

    // if (!config.source) {
    //     config.source = path.join(process.cwd(), options.argv.remain[0]);
    // }

    log.debug('Source: ' + config.source);

    if (config.source === undefined || !fs.existsSync(path.join(config.source))) {
        error = "Source not found.";
    }

    callback(error, result);
};

/**
 * Converts refs to SHAs
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.prepSHAs = function (callback) {
    var self = this,
        config = self.config;

    async.each(config.refs, function (ref, next) {
        exec('git rev-parse ' + ref, {
            cwd: config.yuipath
        }, function(err, stdout) {
            var sha = stdout.trim();
            self.refTable[ref] = sha;
            self.shaTable[sha] = ref;
            next();
        });
    }, function (error) {
        callback(error, null);
    });
};

/**
 * Loops through each repo, triggering a fetch/build process
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepos = function (callback) {
    var self = this,
        config = self.config;

    async.each(this.config.refs, this.prepRepo.bind(this), callback);
};

/**
 * If neccesary, prepares each repo directory
 *
 * @private
 * @param {String}
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepo = function (ref, callback) {
    var self = this,
        config = self.config,
        repoRoot = config.tmproot,
        yuipath = config.yuipath,
        sha = this.refTable[ref],
        repositoryPath = ((ref === "WIP") ? path.join(yuipath) : path.join(repoRoot, 'yui3-' + sha));

    log.debug('Repo: ' + repositoryPath);

    if (!fs.existsSync(repositoryPath + "/build/yui/yui-min.js")) {
        log.info(ref + ": Unable to find seed");

        if (!fs.existsSync(repositoryPath)) {
            log.debug('Making directory');
            fs.mkdirSync(repositoryPath);
            log.info(ref + ": Made dir " + repositoryPath);
        }

        log.debug('Cloning...');
        async.series([
            function(next){ myExec('git init', repositoryPath, next); },
            function(next){ myExec('git remote add origin file://' + yuipath, repositoryPath, next); },
            function(next){ log.info(ref + ': Fetching and building...');myExec('git fetch origin', repositoryPath, next); },
            function(next){ myExec('git checkout ' + sha, repositoryPath, next); },
            function(next){ myExec('yogi build', repositoryPath, next); },
        ], function(err, results){
            // TODO: check to see if seed is available
            callback(err, results);
        });
    }
    else {
        log.info(ref + ": Seed detected. Ready!");
        callback(null, null);
    }
};

/**
 * Creates each Task object.
 * Tasks represent a collection of tests and an individual URL given to Yeti.
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.createTasks = function (callback) {
    var self = this,
        config = self.config;

    var refGroups;
    /**
     * Determine how to split up the refs into new tasks
     *
     * refGroups examples
     * Multi seed  = [[v3.7.0, v3.8.0, v3.9.0]]
     * Single seed = [[v3.7.0], [v3.8.0], [v3.9.0]]
     */
    if (config.multiseed) {
        refGroups = [config.refs];
    }
    else {
        refGroups = config.refs.map(function(ref, i, arr) {
            return [ref];
        });
    }

    /** Iterate through each refGroup, creating Tasks n times */
    async.each(refGroups, function (refGroup, next) {
        var iterations = config.iterations;
        while(iterations-- > 0) {
            new task.create({
                refTable: self.refTable,
                refs: refGroup,
                source: config.source
            });
        }
        next();
    }, callback);
};

/**
 * Collects an array of URLs containing tests
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.gatherTestURLs = function (callback) {
    var self = this,
        config = self.config;

    testURLs = task.tasks.map(function (task, i, arr) {
        return task.meta.testURL;
    });
    log.debug('testURLs: ' + testURLs.join(', '));
    callback(null, null);
};

/**
 * Fires up the Express server
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startExpress = function (callback) {
    var self = this,
        config = self.config,
        app = express();

    server = app.listen(config.port);

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

    // Application properties
    app.set('yuipath', config.yuipath);

    callback(null, null);
};

/**
 * Fires up Yeti
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startYeti = function (callback) {
    var self = this,
        config = self.config,
        yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + config.port + "/yeti/");
    yetiClient.connect(function yetiConnect() { /* Nothing */ });
    yetiClient.on('agentConnect', function handleAgentConnect (agentName) {
        log.debug("Agent connect: " + agentName);

        var batch = this.createBatch({
            useProxy: false,
            tests: testURLs,
            timeout: 4200
        });

        batch.on('agentScriptError', self.handleBatchScriptError);
        batch.on('agentResult', self.handleResult);
        batch.on('complete', self.handleBatchComplete);

        batchCount++;
    });

    log.info('Listening at http://127.0.0.1:' + config.port);

    callback(null, null);
};

/**
 * Spawns a Phantom.js process
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startPhantom = function startPhantom (callback) {
    var self = this,
        config = self.config;

    log.info("Executing tasks with PhantomJS");

    phantomProcess = spawn(path.join(util.yuiBenchPath, 'scripts/load_url.js'), ['http://127.0.0.1:' + config.port], {
        cwd: this.dir
    });

    callback(null, null);
};

/**
 * Executes at the end of the async boot process
 *
 * @private
 */
proto.ready = function ready () {
    var self = this,
        config = self.config;

    self.resetTimeout();
};

/**
 * Used to reset the global inactivity timeout
 *
 * @private
 */
proto.resetTimeout = function resetTimeout () {
    var self = this,
        config = self.config;

    log.debug("Reset timeout timer");

    if (timerTimeout) {
        clearTimeout(timerTimeout);
    }

    timerTimeout = setTimeout(function () {
        log.error("Inactivity timeout");
        self.emit('error');
    }, this.config.timeout);
};

/**
 * Yeti listener to handle JavaScript errors within the browser
 *
 * @private
 * @param {String} User agent
 */
proto.handleBatchScriptError = function handleBatchScriptError (agentName, details) {
    var self = this,
        config = self.config;

    log.error("Agent error!");
    log.error(agentName);
    log.error(details);

    self.emit('error');
};

/**
 * Yeti listener that handles results
 *
 * @private
 * @param {String} User agent
 * @param {Object} results
 */
proto.handleResult = function handleResult (agentName, results) {
    var self = this,
        config = self.config;

    log.info("Got result for task " + results[0].taskID + " from " + agentName)

    /** There is activity, so reset the timeout */
    self.resetTimeout();

    results.forEach(function handleEachResult(result) {
        var taskID = result.taskID,
            t = task.findTaskById(taskID);

        /** Don't need this.  Too much data */
        delete result.stats.sample;

        result.UA = agentName;
        result.date = new Date().getTime();
        result.task = t.meta;

        procResults.push(result);
    });
};

/**
 * Yeti listener that handles batch completions
 *
 * @private
 * @param {String} User agent
 */
proto.handleBatchComplete = function handleBatchComplete (agentName) {
    var self = this,
        config = self.config;

    log.debug('Batch complete for ' + agentName);

    if (++batchesComplete === batchCount) {
        this.emit('complete');
    }
};

/**
 * Parses and outputs the results
 *
 * @private
 */
proto.outputResults = function outputResults () {
    var self = this,
        config = self.config;

    var tasks = Task.tasks;

    if (options.raw) {
        console.log(parser.getRaw(procResults));
    }

    if (options.pretty) {
        console.log(parser.getPretty(procResults));
    }
};

/**
 * A simple utility to execute commands that makes prepRepo() a litter cleaner
 *
 * @private
 * @param {Object} Arguments
 * @param {String} Path pointing to the current working directory to execute this command in
 * @param {Function} Callback to execute upon completion
 */
function myExec(args, cwd, callback) {
    log.info('myExec args: ' + args);
    log.info('myExec cwd: ' + cwd);

    var args = args.split(' '),
        cmd = args.shift(),
        child;

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) { process.stdout.write(data); });
    child.stderr.on('data', function(data) { process.stdout.write(data); });
    child.on('exit', function (error, stdout, stderr) {
        console.log('error', error);
        callback();
    });
}

/** For unit testing purposes */
// module.exports.findYUI = findYUI;
// module.exports.findSource = findSource;
// module.exports.prepSHAs = prepSHAs;
// module.exports.createTasks = createTasks;
