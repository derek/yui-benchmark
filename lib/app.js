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
    
    site = require('../lib/site'),

    refs = options.refs,
    port = options.port,
    testURLs = [],
    server;

 module.exports = function main () {
    var task;

    startExpress();
    
    refs.forEach(function (ref) {
        task = new Task.create({ref: ref});
        testURLs.push(task.testUrl);
    });

    if (options.results) {
        testURLs.push('/results/');
    }
    
    console.log(Task.tasks);

    // Prep each task, then start Yeti
    async.parallel(Task.tasks.map(function (task) {
        return function (callback) {
            task.init(callback);
        };
    }), startYeti);
};

function startExpress () {
    var app = express();

    server = app.listen(port);

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/',                site.index);
    app.get('/task/:taskID',  site.task);
    app.get('/assets/*',        site.asset);
    app.get('/benchmark.js',    site.benchmarkjs);
    app.get('/yui3/:taskID/*',  site.yui);
    app.get('/results/',        site.results);
    app.get('/results/data.js', site.resultsData);
}

function startYeti () {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function () { /* Nothing */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    console.log('Listening at http://127.0.0.1:' + port + '\n');

    ready();
}

function ready () {
    if (options.phantomjs) {
        console.log("Executing tasks with PhantomJS");
        spawn(util.yuiBenchPath + 'scripts/load_url.js', ['http://127.0.0.1:' + port], {
            cwd: this.dir
        });
    }
}

function handleAgentConnect (UA) {
    console.log("Agent connected: " + UA);
    
    var batch = this.createBatch({
        useProxy: false,
        tests: testURLs
    });

    batch.on('agentResult', handleResult);
    batch.on('complete', handleBatchComplete);
}

function handleResult (UA, result) {
    var taskID = result.taskID,
        task = Task.findTaskById(taskID);

    console.log("\t" + result.taskID + " = " + result.value);

    result.UA = UA;
    result.date = new Date().getTime();

    task.result = result;
}

function handleBatchComplete (UA) {
    if (options.output) {
        writeResults();
    }
}

function writeResults () {
    var tasks = Task.tasks,
        outputBase = options.output,
        outputDir,
        outputPath,
        data = [],
        component = tasks[0].result.component,
        name = tasks[0].result.name;

    outputPath = path.join(outputBase, component, name + '.json').toLowerCase().replace(/\s/g, '');
    outputDir = path.basename(outputPath);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        if (!fs.existsSync(outputDir)) {
            throw new Error("Unable to create output dir (" + outputDir + ")");
        }
    }

    if (fs.existsSync(outputPath)) {
        data = require(outputPath);
    }
    
    tasks.forEach(function (task) {
        data.push(task.result);
    });

    // Write to disk
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 4));

    console.log("Added results to " + outputPath)
}