/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var EventEmitter = require("eventemitter2").EventEmitter2,
    util = require('util'),
    fs = require("fs"),
    yeti = require('yeti'),
    path = require('path'),
    async = require('async'),
    spawn = require('win-spawn'),
    exec = require("child_process").exec,
    express = require('express'),
    osenv = require("osenv"),
    task = require('./task'),
    site = require('./server'),
    utilities = require('../utilities'),
    getLogger = utilities.getLogger,
    findTaskById = utilities.findTaskById,
    merge = utilities.merge,
    WIP = 'WIP',
    log,
    proto;

function YUIBenchmark (config) {
    config = (config || {});

    this.results = [];
    this.yuiBenchPath = path.join(__dirname, '../');
    this.refTable = {};
    this.shaTable = {};
    this.server = null;
    this.tasks = [];
    this.testURLs = [];
    this.batchCount = 0;
    this.batchesComplete = 0;
    this.yetiHub = null;
    this.yetiClient = null;
    this.yuipath = null;

    this.config = this.normalizeConfig(config);

    log = getLogger(config.loglevel);
}

util.inherits(YUIBenchmark, EventEmitter);

module.exports = YUIBenchmark;

proto = YUIBenchmark.prototype;

/**
 * Normalizes a configuration object to contain all the values YUI Benchmark needs
 *
 * @public
 */
proto.normalizeConfig = function (config) {
    var defaultConfig = {
        refs: [],
        source: null,
        yuipath: null,
        wip: true,
        raw: false,
        pretty: true,
        multiseed: false,
        port: 3000,
        timeout: 300,
        iterations: 1,
        tmproot: osenv.tmpdir()
    };

    if (config.argv) {
        delete config.argv;
    }

    config = merge(defaultConfig, config);

    if (config.ref) {
        if (config.ref.join) {
            config.refs = config.ref;
        }
        else {
            config.refs = [config.ref];
        }
        delete config.ref;
    }

    config.timeout *= 1000;

    if (config.wip !== false) {
        config.refs.push(WIP);
    }

    return config;
};

/**
 * Kicks off the app
 *
 * @public
 */
proto.boot = function () {
    var self = this;

    /* A series of methods to execute to boot up the app */
    var bootSeries = [
        self.findYUI.bind(self),
        self.findSource.bind(self),
        self.prepSHAs.bind(self),
        self.prepRepos.bind(self),
        self.createTasks.bind(self),
        self.gatherTestURLs.bind(self),
        self.startExpress.bind(self),
        self.startYeti.bind(self)
    ];

    async.series(bootSeries, function (err, results) {
        if (err) {
            self.emit('error', err);
        }
        else {
            self.emit('ready');
        }
    });
};

/**
 * Finds the absolute path to the root of the local YUI repo we should be in
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.findYUI = function findYUI(callback) {
    var self = this,
        config = self.config,
        args = {
            cwd: (config.yuipath || process.cwd())
        };

    exec('git rev-parse --show-toplevel', args, function(error, stdout) {
        var yuipath = stdout.trim(),
            seedPath = path.join(yuipath, '/src/yui/js/yui.js');

        if (fs.existsSync(seedPath)) {
            self.yuipath = yuipath;
        }
        else if (!error) {
            error = 'Seed not found.  Tried at ' + seedPath;
        }

        callback(error);
    });
};

/**
 * Finds the absolute path to the source test file
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.findSource = function findSource (callback) {
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
proto.prepSHAs = function prepSHAs (callback) {
    var self = this,
        config = self.config,
        args = {
            cwd: self.yuipath
        },
        sha;

    async.each(config.refs, function (ref, next) {
        exec('git rev-parse ' + ref, args, function(err, stdout) {
            sha = stdout.trim();

            if (sha.length === 40 || sha === WIP) {
                self.refTable[ref] = sha;
                self.shaTable[sha] = ref;
                next();
            }
            else {
                next('Invalid ref: ' + sha);
            }
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
proto.prepRepos = function prepRepos (callback) {
    var self = this,
        config = self.config,
        refs = self.config.refs,
        prepRepo = self.prepRepo.bind(this);

    async.each(refs, prepRepo, callback);
};

/**
 * If neccesary, prepares each repo directory
 *
 * @private
 * @param {String}
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepo = function prepRepo (ref, callback) {
    var self = this,
        config = self.config,
        sha = self.refTable[ref],
        repoRoot = config.tmproot,
        yuipath = self.yuipath,
        repositoryPath = ((ref === WIP) ? path.join(yuipath) : path.join(repoRoot, 'yui3-' + sha)),
        seedPath = repositoryPath + "/build/yui/yui-min.js";

    log.debug('Repo: ' + repositoryPath);

    if (fs.existsSync(seedPath)) {
        log.info(ref + ": Seed detected. Ready!");
        callback(null, null);
    }
    else {
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
            function(next){ log.info(ref + ': Fetching and building...'); myExec('git fetch origin', repositoryPath, next); },
            function(next){ myExec('git checkout ' + sha, repositoryPath, next); },
            function(next){ myExec('yogi build', repositoryPath, next); }
        ], function(err, results){
            // TODO: check to see if seed is available
            callback(err, results);
        });
    }
};

/**
 * Creates each Task object.
 * Tasks represent a collection of tests and an individual URL given to Yeti.
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.createTasks = function createTasks (callback) {
    var self = this,
        config = self.config,
        refTable = self.refTable,
        refGroups, t;

    /*
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

    /* Iterate through each refGroup, creating Tasks n times */
    async.each(refGroups, function (refGroup, next) {
        var iterations = config.iterations;
        while(iterations-- > 0) {
            t = new task.create({
                yuipath: self.yuipath,
                refTable: refTable,
                refs: refGroup,
                source: config.source,
                tmproot: config.tmproot
            });
            self.tasks.push(t);
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
proto.gatherTestURLs = function gatherTestURLs (callback) {
    var self = this,
        config = self.config,
        tasks = self.tasks;

    self.testURLs = tasks.map(function (task, i, arr) {
        return task.meta.testURL;
    });

    log.debug('testURLs: ' + self.testURLs.join(', '));
    callback(null, null);
};

/**
 * Fires up the Express server
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startExpress = function startExpress (callback) {
    var self = this,
        config = self.config,
        app = express(),
        port = config.port,
        server = self.server = app.listen(port);

    site.setLogger(log);

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
    app.post('/log/', site.log);

    // Application properties
    app.set('yuipath', self.yuipath);
    app.set('tasks', self.tasks);

    callback(null, null);
};

/**
 * Fires up Yeti
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startYeti = function startYeti (callback) {
    var self = this,
        config = self.config,
        handleAgentConnect = self.handleAgentConnect.bind(self),
        port = config.port,
        server = self.server,
        yetiHub, yetiClient;

    yetiHub = self.yetiHub = yeti.createHub({loglevel:"silent"}),
    yetiHub.attachServer(server);

    yetiClient = self.yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function yetiConnect() { /* Nothing */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    log.info('Listening at http://127.0.0.1:' + port);

    callback(null, null);
};

/**
 * Yeti listener to handle agent connects
 *
 * @private
 * @param {String} User agent
 */
proto.handleAgentConnect = function handleAgentConnect (agentName) {
    log.debug("Agent connect: " + agentName);

    var self = this,
        yetiClient = self.yetiClient,
        testURLs = self.testURLs,
        handleBatchScriptError  = self.handleBatchScriptError.bind(self),
        handleResult = self.handleResult.bind(self),
        handleBatchComplete = self.handleBatchComplete.bind(self),
        batch = yetiClient.createBatch({
            useProxy: false,
            tests: testURLs,
            timeout: 4200
        });

    batch.on('agentScriptError', handleBatchScriptError);
    batch.on('agentResult', handleResult);
    batch.on('complete', handleBatchComplete);

    self.batchCount += 1;
};

/**
 * Yeti listener to handle JavaScript errors within the browser
 *
 * @private
 * @param {String} User agent
 */
proto.handleBatchScriptError = function handleBatchScriptError (agentName, details) {
    var self = this;

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
proto.handleResult = function handleResult (agentName, response) {
    var self = this,
        tasks = self.tasks,
        results = response.results;

    log.info("Got result for task " + results[0].taskID + " from " + agentName);

    self.emit('result');

    results.forEach(function handleEachResult (result) {
        var taskID = result.taskID,
            t = findTaskById(tasks, taskID);

        /* Don't need this.  Too much data */
        delete result.stats.sample;

        result.UA = agentName;
        result.date = new Date().getTime();
        result.task = t.meta;

        self.results.push(result);
    });
};

/**
 * Yeti listener that handles batch completions
 *
 * @private
 * @param {String} User agent
 */
proto.handleBatchComplete = function handleBatchComplete (agentName) {
    var self = this;

    log.debug('Batch complete for ' + agentName);

    self.batchesComplete += 1;

    if (self.batchesComplete === self.batchCount) {
        self.emit('complete', self.results);
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

    var cmd,
        child;

    args = args.split(' ');
    cmd = args.shift();

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) { process.stdout.write(data); });
    child.stderr.on('data', function(data) { process.stdout.write(data); });
    child.on('exit', function (error, stdout, stderr) {
        console.log('error', error);
        callback();
    });
}
