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
    express = require('express'),
    
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
    procResults = [],
    batchCount = 0,
    batchesComplete = 0,
    phantomProcess,
    server;

 module.exports = function main () {
    var task, i;

    startExpress();
    
    async.each(refs, function (ref, next) {
        util.gitRefToSHA(ref, function (err, sha) {
            if (sha.length === 40) {
                task = new Task.create({
                    sha: sha, 
                    ref: ref, 
                    source: options.source, 
                    iterations: options.iterations
                });

                for(i = 0; i < task.meta.testIterations; i++) {
                    testURLs.push(path.join(task.meta.testURL, i.toString()));
                }

                next();
            }
            else {
                next("Ref '" + ref + "' is invalid.");
            }
        });
    }, function (err) {
        if (err) {
            throw new Error(err);
        }
        else {
            if (options.results) {
                testURLs.push('/results/');
            }

            log.debug('testURLs');
            log.debug(testURLs);

            // Prep each task, then start Yeti
            async.parallel(Task.tasks.map(function (task) {
                return function (callback) {
                    task.init(callback);
                };
            }), startYeti);
        }
    });
};

function startExpress () {
    var app = express();

    server = app.listen(port);

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);
    app.get('/task/:taskID/:ref/:iterationID', site.task);
    app.get('/assets/*', site.asset);
    app.get('/benchmark.js', site.benchmarkjs);
    app.get('/yui3/:ref/*', site.yui);
    app.get('/results/', site.results);
    app.get('/results/data.js', site.resultsData);
}

function startYeti () {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function () { /* Nothing */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    log.info('Listening at http://127.0.0.1:' + port);

    ready();
}

function ready () {
    if (options.phantomjs) {
        log.debug("Executing tasks with PhantomJS");
        phantomProcess = spawn(path.join(util.yuiBenchPath, 'scripts/load_url.js'), ['http://127.0.0.1:' + port], {
            cwd: this.dir
        });
    }
}

function handleAgentConnect (UA) {
    log.debug("Agent connect: " + UA);
    
    batchCount++;

    var batch = this.createBatch({
        useProxy: false,
        tests: testURLs
    });

    batch.on('agentResult', handleResult);
    batch.on('complete', handleBatchComplete);
}

function handleResult (UA, results) {
    results.forEach(function (result) {
        var taskID = result.taskID,
            task = Task.findTaskById(taskID);

        log.debug("Result! taskID:" + result.taskID + " ref:" + task.meta.ref + " value:" + result.value + " name:" + result.name + " UA:" + UA);

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
    var tasks = Task.tasks,
        outputPath = tasks[0].meta.outputPath,
        outputDir = path.basename(outputPath),
        outputRaw = parser.getRaw(procResults),
        outputPretty = parser.getPretty(procResults);

    // Grab the previous results
    if (fs.existsSync(outputPath)) {
        tasks.concat(require(outputPath));
    }

    // Write to stdout
    if (options.output.toLowerCase() == "raw") {
        console.log(outputRaw);
    }
    else if (options.output.toLowerCase() == "pretty") {
        console.log(outputPretty);
    }

    // Write to disk
    if (options.datapath) {
        fs.writeFileSync(outputPath, outputRaw);
        log.info("Added results to " + outputPath);
    }
}

function exit () {
    log.info('Exiting');
    if (phantomProcess) {
        phantomProcess.kill();
    }
    process.exit();
}