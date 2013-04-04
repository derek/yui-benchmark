/*
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

    refs = options.refs,
    port = options.port,
    testID = util.testID,
    testURLs = [],
    procResults = [], // Results of the performance tests executed by this process
    batchCount = 0,
    batchesComplete = 0,
    phantomProcess,
    server;

 module.exports = function main () {
    async.series([
        findYUI,
        findSource,
        prepSHAs,
        prepRepos,
        createTasks,
        gatherTestURLs,
        startExpress,
        startYeti,
        ready
    ]);
};

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

function findSource (callback) {
    if (!options.source) {
        options.source = path.join(process.cwd(), options.argv.remain[0]);
    }

    if (options.source === undefined || !fs.existsSync(path.join(options.source))) {
        throw new Error("source not found. Check --source option");
    }
console.log(options.source);
    callback();
}

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

function prepRepos (callback) {
    async.each(options.refs, prepRepo, callback);
}

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

function gatherTestURLs (callback) {
    Task.tasks.forEach(function (task) {
        testURLs.push(task.meta.testURL);
    });

    callback();
}


function startExpress (callback) {
    var app = express();

    server = app.listen(port);

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);
    app.get('/task/:taskID/', site.task);
    app.get('/module/:taskID/:testID/*', site.testjs);
    app.get('/assets/*', site.asset);
    app.get('/benchmark.js', site.benchmarkjs);
    app.get('/yui/:taskID/:testID/:ref/*', site.yui);
    // app.get('/results/', site.results);
    // app.get('/results/data.js', site.resultsData);

    callback();
}

function startYeti (callback) {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function yetiConnect() { /* Nothing */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    log.info('Listening at http://127.0.0.1:' + port);

    callback();
}

function ready () {
    if (options.phantomjs) {
        log.debug("Executing tasks with PhantomJS");
        phantomProcess = spawn(path.join(util.yuiBenchPath, 'scripts/load_url.js'), ['http://127.0.0.1:' + port], {
            cwd: this.dir
        });

        // Handle errors.  This methodology could probably be improved. Is there a Yeti API?
        phantomProcess.stdout.on('data', function(data) {
            // if (String(data).match('errorHandler')) {
                console.log(String(data));
                // exit();
            // }
        });
    }
}

function handleAgentConnect (UA) {
    log.debug("Agent connect: " + UA);

    var batch = this.createBatch({
        useProxy: false,
        tests: testURLs,
        timeout: 4200
    });

    batch.on('agentResult', handleResult);
    batch.on('complete', handleBatchComplete);

    batchCount++;
}

function handleResult (UA, results) {
    results.forEach(function handleEachResult(result) {
        var taskID = result.taskID,
            task = Task.findTaskById(taskID);

        log.debug("Result! taskID:" + result.taskID + " ref:" + task.meta.ref + " value:" + result.value + " name:" + result.name + " UA:" + UA);
        delete result.stats.sample;
        result.UA = UA;
        result.date = new Date().getTime();
        result.task = task.meta;

        procResults.push(result);
    });
}

function handleBatchComplete (UA) {
    log.debug('Batch complete - ' + UA);

    batchesComplete++;

    if (batchesComplete == batchCount) {
        outputResults();
        exit();
    }
}

function outputResults () {
    var tasks = Task.tasks;

    if (options.raw) {
        console.log(parser.getRaw(procResults));
    }

    if (options.pretty) {
        console.log(parser.getPretty(procResults));
    }
}

function exit () {
    log.info('Exiting');
    if (phantomProcess) {
        phantomProcess.kill();
    }
    process.exit();
}

// A simple utility to execute commands
function myExec(args, cwd, cb) {
    log.debug('myExec args: ' + args);
    log.debug('myExec cwd: ' + cwd);

    var args = args.split(' '),
        cmd = args.shift(),
        child;

    child = spawn(cmd, args, {cwd: cwd});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) { process.stdout.write(data); });
    // child.stderr.on('data', function(data) { self.log(data); });
    child.on('exit', function (error, stdout, stderr) {
        cb();
    });
}