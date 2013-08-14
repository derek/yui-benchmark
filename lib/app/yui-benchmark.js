/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint latedef:false */
'use strict';

var EventEmitter = require('eventemitter2').EventEmitter2,
    fs = require('fs'),
    util = require('util'),
    yeti = require('yeti'),
    path = require('path'),
    async = require('async'),
    osenv = require('osenv'),
    cpr = require('cpr'),
    vm = require('vm'),
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
    WIP = 'Working',
    log,
    proto;

/**
* @class YUIBenchmark
* @constructor
*/
function YUIBenchmark () {
    this.init.apply(this, arguments);
}

// Inherits from EventEmitter
util.inherits(YUIBenchmark, EventEmitter);

// Localize YUIBenchmark.prototype
proto = YUIBenchmark.prototype;

// Export the class
module.exports = YUIBenchmark;


/*********************************
 * YUIBenchmark prototype methods (private)
 *********************************/

/**
 * YUI Benchmark's constructor
 *
 * @method constructor
 * @param {Object}
 */
proto.init = function (config) {
    config = (config || {});

    this.results = [];
    this.refTable = {};
    this.server = null;
    this.tasks = [];
    this.repo = null;
    this.yeti = {
        hub: null,
        client: null,
        batch: null
    };

    this.config = this.normalizeConfig(config);

    log = getLogger(config.loglevel);
};

/**
 * Normalizes a configuration object to contain all the values YUI Benchmark needs
 *
 * @method normalizeConfig
 * @private
 */
proto.normalizeConfig = function (config) {
    if (config.argv) {
        delete config.argv;
    }

    // Create a new config object, overwriting any defaults
    config = merge({
        iterations: 1,
        port: 3000,
        refs: [],
        repo: null,
        source: null,
        timeout: 300,
        tmp: osenv.tmpdir(),
        working: true
    }, config);

    config.refs = config.ref || [];
    delete config.ref;

    if (config.working !== false) {
        config.refs.push(WIP);
    }

    // Timeouts are specified in seconds
    config.timeout *= 1000;

    return config;
};

/**
 * Finds the absolute path to the root of the local YUI repo we should be in
 *
 * @method findYUISeed
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.findYUISeed = function findYUISeed(callback) {
    var self = this,
        config = self.config,
        cwd = (config.repo || process.cwd());

    exec('git', ['rev-parse', '--show-toplevel'], cwd, handleExecComplete);

    function handleExecComplete(err, stdout) {
        var repo = stdout.trim(),
            seedPath = path.join(repo, '/src/yui/js/yui.js');

        if (fs.existsSync(seedPath)) {
            self.repo = repo;
        }
        else if (!err) {
            err = 'Seed not found.  Tried at ' + seedPath;
        }

        callback(err);
    }
};

/**
 * Gathers details about the target refs and populates refTable
 *
 * @method gatherRefDetails
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.gatherRefDetails = function gatherRefDetails (callback) {
    var self = this,
        config = self.config,
        refTable = self.refTable,
        repo = self.repo;

    if (config.refs.length < 1) {
        throw new Error('No refs specified.');
    }

    async.eachSeries(config.refs, prepRef, callback);

    // Executed for each ref
    function prepRef (ref, next) {
        getRefDate(ref, function (err, date) {
            refTable[ref] = {
                date: date,
                ref: ref,
                sha: null,
                rebuild: false
            };

            if (ref === WIP) {
                // If WIP
                refTable[ref].sha = null;
                next();
            }
            else if (ref.length === 40) {
                // If SHA
                refTable[ref].rebuild = true;
                refTable[ref].sha = ref;
                next();
            }
            else {
                // If tag
                if (!ref.match(/^v3\.[0-9]{1,2}/)) {
                    // If it's not a version tag, rebuild the repo
                    refTable[ref].rebuild = true;
                }

                getRefSHA(ref, function (error, sha) {
                    refTable[ref].sha = sha;
                    next(error);
                });
            }

            // Obtains the ref's SHA-1
            function getRefSHA(ref, callback) {
                exec('git', ['rev-parse', ref], repo, function(err, stdout) {
                    var sha = stdout.trim();

                    if (sha.length !== 40) {
                        err = 'Invalid ref: ' + ref;
                    }

                    callback(err, sha);
                });
            }
        });

        // Obtains the ref's commit time
        function getRefDate(ref, callback) {
            var args = [];

            args.push('show');
            if (ref !== WIP) {
                args.push(ref);
            }
            args.push('--format=%ct');

            exec('git', args, repo, function(err, stdout) {
                var date = stdout.split('\n')[0];
                callback(err, date);
            });
        }
    }
};


/**
 * Creates the tasks for Yeti and compiles the test suites.
 * Tasks represent a (ref + suite + iteration) combination
 *
 * @method createTasks
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.createTasks = function createTasks (callback) {
    var self = this,
        config = self.config,
        iterations = config.iterations,
        bottomHTML = fs.readFileSync(path.join(yuiBenchmarkPath, 'lib/assets/yeti-benchmarkjs.html'), 'utf-8'),
        refTable = self.refTable,
        tasks = self.tasks,
        sourceDir = path.join(path.dirname(config.source)),
        repo = self.repo,
        refs = Object.keys(refTable),
        context = {suite: null},
        suite,
        refsByDate,
        refsByDateStr,
        i;

    // Sort the refs by commit date
    refsByDate = refs.map(function (ref) {
        return refTable[ref];
    }).sort(function(a, b) {
        return a.date > b.date;
    });

    // Turn the config string into an object
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/perf-suite.js')) + fs.readFileSync(config.source), context);
    suite = context.suite.exportConfig();

    // For logging
    refsByDateStr = refsByDate.map(function (r) {return r.ref;}).join(', ');

    log.debug('Compiling "%s" (contains %d tests) for %d refs (%s)', suite.name, suite.tests.length, refs.length, refsByDateStr);

    // Iterate through each ref and assemble the test data
    refsByDate.forEach(function (refData) {
        for (i=0; i < iterations; i++) {
            var taskID = tasks.length.toString(),
                ref = refData.ref,
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
                buildPath: (ref === WIP ? path.join(repo, 'build') : path.join(repo, '.builds', ref + '-' + sha))
            });
        }
    });

    callback();
};

/**
 * Loops through each repo, triggering a fetch/build process
 *
 * @method prepRepos
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepos = function prepRepos (callback) {
    var self = this,
        refs = Object.keys(self.refTable),
        prepRepo = self.prepRepo.bind(this),
        tasks;

    // Don't do anything with the working tree
    if (refs.indexOf(WIP) !== -1) {
        refs.splice(refs.indexOf(WIP), 1);
    }

    // Create an array of prepRepo
    tasks = refs.map(function (ref) {
        return function (cb) {
            prepRepo(ref, cb);
        };
    });

    // Limit the repo building to 3 at a time
    async.parallelLimit(tasks, 3, callback);
};

/**
 * If neccesary, prepares each repo directory
 *
 * @method prepRepo
 * @private
 * @param {String}
 * @param {Function} Callback to execute upon completion
 */
proto.prepRepo = function prepRepo (ref, completeTask) {
    var self = this,
        config = self.config,
        repo = self.repo,
        refData = self.refTable[ref],
        sha = refData.sha,
        rebuild = refData.rebuild,
        repositoryPath = path.join(config.tmp, 'yui3-' + sha),
        buildDir = path.join(repo, '.builds', ref + '-' + sha),
        seedPath = buildDir + '/yui/yui-min.js',
        prepSequence;

    log.debug('%s: prepRepo start', ref);

    prepSequence = [
        prepRepoDir,
        fetchRepo,
        checkoutRepo,
        buildRepo,
        moveBuild
    ];

    seedExists(function (exists) {
        if (exists) {
            log.info('%s: seed ready', ref);
            completeTask();
        }
        else {
            log.info('%s: Creating seed...', ref);
            async.series(prepSequence, completeTask);
        }
    });

    function seedExists(cb) {
        fs.exists(seedPath, cb);
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

        function repoExists(cb) {
            fs.exists(repositoryPath, cb);
        }

        function mkRepoDir (cb) {
            log.debug('%s: Making directory: %s', ref, repositoryPath);
            mkdirp(repositoryPath, cb);
        }

        function initRepo (cb) {
            repoExec('git', ['init'], cb);
        }

        function addOrigin (cb) {
            repoExec('git', ['remote', 'add', 'origin', 'file://' + repo], cb);
        }
    }

    function fetchRepo (cb) {
        repoExec('git', ['fetch', 'origin'], cb);
    }

    function checkoutRepo (cb) {
        repoExec('git', ['checkout', sha], cb);
    }

    function buildRepo (cb) {
        if (rebuild) {
            repoExec('yogi', ['build'], cb);
        }
        else {
            cb();
        }
    }

    function moveBuild (cb) {
        var source = path.join(repositoryPath, 'build'),
            target = buildDir;

        log.debug('%s: Copying %s to %s', ref, source, target);

        cpr(source, target, {}, cb);
    }

    function repoExec(cmd, args, cb) {
        exec(cmd, args, repositoryPath, cb);
    }
};

/**
 * Fires up the Express server
 *
 * @method startExpress
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startExpress = function startExpress (callback) {
    var self = this,
        config = self.config,
        port = config.port,
        app;

    app = express();

    self.server = app.listen(port);

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

    callback();
};

/**
 * Fires up Yeti
 *
 * @method startYeti
 * @private
 * @param {Function} Callback to execute upon completion
 */
proto.startYeti = function startYeti (callback) {
    var self = this,
        config = self.config,
        port = config.port,
        server = self.server,
        yetiClient;

    self.yeti.hub = yeti.createHub({ loglevel:'silent' }).attachServer(server);

    yetiClient = self.yeti.client = yeti.createClient('http://127.0.0.1:' + port + '/yeti/');

    yetiClient.on('agentConnect', function handleAgentConnect (agentName) {
        console.log('  Agent connect: %s', agentName);
    });

    yetiClient.on('agentSeen', function (agentName) {
        log.debug('Saw %s', agentName);
    });

    yetiClient.connect(callback);
};

/**
 * Yeti listener to handle JavaScript errors within the browser
 *
 * @method handleAgentScriptError
 * @private
 * @param {String} User agent
 */
proto.handleAgentScriptError = function handleAgentScriptError (agentName, details) {
    var self = this;

    log.error('Agent error!');
    log.error(agentName);
    log.error(details);

    self.emit('error');
};

/**
 * Yeti listener that handles results
 *
 * @method handleAgentResult
 * @private
 * @param {String} User agent
 * @param {Object} results
 */
proto.handleAgentResult = function handleAgentResult (agentName, response) {
    var self = this,
        tasks = self.tasks,
        results = response.results,
        url = response.url,
        taskID = url.split('/')[4],
        task = tasks[taskID];

    console.log('Got result from %s', agentName);

    results.forEach(function handleEachResult (result) {
        result.name = htmlEntitiesDecode(result.name);
        result.UA = agentName;
        result.date = new Date().getTime();
        result.ref = task.ref;
        result.sha = task.sha;

        // Don't need this.  Too much data.
        delete result.stats.sample;

        self.results.push(result);
    });

    self.emit('result');
};

/**
 * Yeti listener that handles batch completions
 *
 * @method handleBatchComplete
 * @private
 * @param {String} User agent
 */
proto.handleBatchComplete = function handleBatchComplete () {
    var self = this;

    self.emit('complete', self.results);
};


/*****************************************
 * YUIBenchmark prototype methods (public)
 ****************************************/


/**
 * The boot-up sequence for YUI Benchmark
 *
 * @method boot
 * @public
 */
proto.boot = function () {
    var self = this;

    // A series of methods to execute to boot up the app
    async.series([
        self.findYUISeed.bind(self),
        self.gatherRefDetails.bind(self),
        self.createTasks.bind(self),
        self.prepRepos.bind(self),
        self.startExpress.bind(self),
        self.startYeti.bind(self)
    ], bootComplete);

    function bootComplete (err) {
        if (err) {
            throw new Error(err);
        }

        self.emit('ready');
    }
};

/**
 * Initiates the testing process
 *
 * @method executeTests
 * @public
 */
proto.executeTests = function executeTests () {
    var self = this,
        yetiClient = self.yeti.client,
        tasks = self.tasks,
        testURLs,
        batch;

    testURLs = tasks.map(function (task) {
        return task.url;
    });

    log.debug('testURLs: %s', testURLs.join(', '));

    batch = self.yeti.batch = yetiClient.createBatch({
        tests: testURLs,
        useProxy: false,
        timeout: 4200
    });

    batch.on('agentScriptError', self.handleAgentScriptError.bind(self));
    batch.on('agentResult', self.handleAgentResult.bind(self));
    batch.on('complete', self.handleBatchComplete.bind(self));

    // batch.on("agentError", );
    // batch.on("agentComplete", );
    // batch.on("agentProgress", );
    // batch.on("agentBeat", );
    // batch.on("dispatch", );
    // batch.on("end", );
};

/*********************************
 * Utilities
 *********************************/

/**
 * A simple utility to execute commands that makes prepRepo() a litter cleaner
 *
 * @private
 * @param {Object} Arguments
 * @param {String} Path pointing to the current working directory to execute this command in
 * @param {Function} Callback to execute upon completion
 */
function exec(cmd, args, cwd, callback) {
    var stdoutStr = '',
        stderrStr = '',
        child;

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
