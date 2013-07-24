/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var EventEmitter = require("eventemitter2").EventEmitter2,
    fs = require("fs"),
    util = require('util'),
    yeti = require('yeti'),
    path = require('path'),
    async = require('async'),
    osenv = require("osenv"),
    vm = require("vm"),
    mkdirp = require('mkdirp'),
    spawn = require('win-spawn'),
    express = require('express'),
    site = require('./server'),
    compile = require('./compiler'),
    utilities = require('../utilities'),
    getLogger = utilities.getLogger,
    merge = utilities.merge,
    htmlEntitiesDecode = utilities.htmlEntitiesDecode,
    yuiBenchmarkPath = path.join(__dirname, '../../'),
    fooPaths = [],
    WIP = 'WIP',
    log,
    proto;

function YUIBenchmark (config) {
    config = (config || {});

    this.results = [];
    this.yuiBenchPath = path.join(__dirname, '../');
    this.refTable = {};
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
        self.prepSHAs.bind(self),
        self.createTasks.bind(self),
        self.gatherTestURLs.bind(self),
        self.prepRepos.bind(self),
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
        cwd = (config.yuipath || process.cwd());

    exec('git rev-parse --show-toplevel', cwd, function(err, stdout, stderr) {
        var yuipath = stdout.trim(),
            seedPath = path.join(yuipath, '/src/yui/js/yui.js');

        if (fs.existsSync(seedPath)) {
            self.yuipath = yuipath;
        }
        else if (!err) {
            err = 'Seed not found.  Tried at ' + seedPath;
        }

        callback(err);
    });

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
        refTable = self.refTable,
        yuipath = self.yuipath,
        sha;

    async.eachSeries(config.refs, prepSha, callback);

    function prepSha (ref, next) {
        getCommitDate(ref, function (err, date) {
            if (err) {
                log.error(err);
            }

            refTable[ref] = {
                ref: ref,
                date: date,
                rebuild: false
            };

            if (!ref.match(/^v/) && ref.length === 40 ) {
                refTable[ref].rebuild = true;
            }

            if (ref === WIP) {
                refTable[ref].sha = null;
                next();
            }
            else if (ref.length === 40) {
                refTable[ref].sha = ref;
                next();
            }
            else {
                getCommitSHA(ref, function (err, sha) {
                    refTable[ref].sha = sha;
                    next(err);
                });
            }

            function getCommitSHA(ref, callback) {
                exec('git rev-parse ' + ref, yuipath, function(err, stdout, stderr) {
                    var sha = stdout.trim(),
                        err = null;

                    if (sha.length !== 40) {
                        err = 'Invalid ref: ' + ref;
                    }

                    callback(err, sha);
                });
            }
        });

        function getCommitDate(ref, callback) {
            exec('git show --format="%ci"' + (ref === WIP ? '' : ' ' + ref), yuipath, function(err, stdout, stderr) {
                var date = stdout.split('\n')[0];
                callback(err, date);
            });
        }
    }
};


/**
 * Creates the tasks for Yeti and compiles the test suites.
 * Tasks represent a ref + suite combination
 *
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.createTasks = function createTasks (callback) {

    var self = this,
        config = self.config,
        bottomHTML = fs.readFileSync(path.join(yuiBenchmarkPath, 'lib/templates/yeti-benchmarkjs.html'), 'utf-8'),
        refTable = self.refTable,
        tasks = self.tasks,
        sourceDir = path.join(path.dirname(config.source)),
        yuipath = self.yuipath,
        refs = Object.keys(refTable),
        context = {module: {exports: null}},
        suites;

    // Turn the config string into an object
    vm.runInNewContext('module.exports = ' + fs.readFileSync(config.source), context);
    suites = context.module.exports;

    // If it's just a single suite, turn it into an array of suites
    if (typeof suites.push !== 'function') {
        suites = [suites];
    }

    suites.forEach(function (suite) {

        log.info('Compiling "%s" (containing %d tests) for %d refs (%s)', suite.title, suite.tests.length, refs.length, refs.join(', '));

        refs.forEach(function (ref) {
            var taskID = tasks.length.toString(),
                sha = refTable[ref].sha,
                test;

            suite.bottomHTML = bottomHTML;
            suite.benchmarkjsURL = '/benchmark.js';
            suite.yui = (suite.yui || {});
            suite.yui.src = path.join('/task/', taskID, '/yui/build/yui/yui.js');
            suite.yui.config = (suite.yui.config || {});
            suite.yui.config.base = path.join('/task/', taskID, '/yui/build/');

            // Import the HTML snippet if a path is specified
            if (suite.html) {
                if (fs.existsSync(path.join(sourceDir, suite.html))) {
                    suite.html = fs.readFileSync(path.join(sourceDir, suite.html), 'utf-8');
                }
            }

            test = compile(suite, sourceDir);

            tasks.push({
                taskID: taskID,
                ref: ref,
                sha: sha,
                html: test.html,
                assets: test.assets,
                url: path.join('/task', taskID, test.name),
                buildPath: (ref === WIP ? path.join(yuipath, 'build') : path.join(yuipath, '.builds', ref + '-' + sha))
            });
        });
    });

    callback();
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
        return task.url;
    });

    log.debug('testURLs: %s', self.testURLs.join(', '));
    callback(null, null);
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
        refs = Object.keys(self.refTable),
        prepRepo = self.prepRepo.bind(this);

    // Don't do anything with the working path
    refs.splice(refs.indexOf(WIP), 1);

    // TODO: Do these with async.parallelLimit?
    async.each(refs, prepRepo, callback);
};

/**
 * If neccesary, prepares each repo directory
 *
 * @private
 * @param {String}
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepo = function prepRepo (ref, completeTask) {
    var self = this,
        config = self.config,
        yuipath = self.yuipath,
        refData = self.refTable[ref],
        sha = refData.sha,
        rebuild = refData.rebuild,
        tmproot = config.tmproot,
        repositoryPath = path.join(tmproot, 'yui3-' + sha),
        buildDir = path.join(yuipath, '.builds', ref + '-' + sha),
        seedPath = buildDir + "/yui/yui-min.js",
        prepSequence;

    prepSequence = [
        seedExists,
        mkBuildDir,
        prepRepoDir,
        fetchRepo,
        checkoutRepo,
        // buildRepo,
        moveBuild
    ];

    async.series(prepSequence, function(err, results){
        seedExists(function(exists) {
            if (exists) {
                log.info(ref + ': Seed detected!')
                completeTask(null, ref + ': Seed detected!');
            }
            else {
                completeTask(ref + ': Unable to build seed');
            }
        });
    });

    function seedExists(cb) {
        fs.exists(seedPath, cb);
    }

    function repoExists(cb) {
        fs.exists(repositoryPath, cb);
    }

    function prepRepoDir (cb) {
        repoExists(function (exists) {
            if (!exists) {
                async.series([mkRepoDir, initRepo, addOrigin], cb);
            }
            else {
                cb();
            }
        });

        function mkRepoDir (cb) {
            log.debug(ref + ": Making directory: " + repositoryPath);
            mkdirp(repositoryPath, cb);
        }

        function initRepo (cb) {
            repoExec('git init', cb);
        }

        function addOrigin (cb) {
            repoExec('git remote add origin file://' + yuipath, cb);
        }
    }

    function fetchRepo (cb) {
        repoExec('git fetch origin', cb);
    }

    function checkoutRepo (cb) {
        repoExec('git checkout ' + sha, cb);
    }

    function buildRepo (cb) {
        if (rebuild) {
            repoExec('yogi build', cb);
        }
        else {
            cb();
        }
    }

    function mkBuildDir (cb) {
        log.debug(ref + ": Making directory: " + buildDir);
        mkdirp(buildDir, cb);
    }

    function moveBuild (cb) {
        repoExec('cp -r ./build/ ' + buildDir, cb);
    }

    function repoExec(cmd, cb) {
        exec(cmd, repositoryPath, cb)
    }
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
    app.get('/task/:taskID/:test.html', site.test);
    app.get('/task/:taskID/yui/build/*', site.yui);
    app.get('/task/:taskID/assets/:file', site.assets);
    app.get('/benchmark.js', site.benchmarkjs);

    // Application properties
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
    log.info("Agent connect: %s", agentName);

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
        results = response.results,
        url = response.url,
        taskID = url.split('/')[4],
        task = tasks[taskID];

    log.info("Got result for task " + taskID + " from " + agentName);

    self.emit('result');

    results.forEach(function handleEachResult (result) {
        result.name = htmlEntitiesDecode(result.name)
        result.UA = agentName;
        result.date = new Date().getTime();
        result.ref = task.ref;
        result.sha = task.sha;
        result.samples = result.stats.sample.length;

        /* Don't need this.  Too much data */
        delete result.stats.sample;

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

    log.debug('Batch complete for %s', agentName);

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
function exec(args, cwd, callback) {
    var stdoutStr = '',
        stderrStr = '',
        cmd,
        child;

    args = args.split(' ');
    cmd = args.shift();

    log.debug('exec: %s [%s] %s', cmd, args, cwd);

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function(data) {
        stdoutStr += data.toString();
    });

    child.stderr.on('data', function(data) {
        stderrStr += data.toString();
    });

    child.on('close', function (err) {
        if (err) {
            log.error(stderrStr);
        }
        callback(err, stdoutStr, stderrStr);
    });
}
