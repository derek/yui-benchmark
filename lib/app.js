/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    yeti = require('yeti'),
    async = require('async'),
    spawn = require('win-spawn'),
    express = require('express'),
    
    util = require('./util'),
    Task = require('./task'),
    options = require('./opts'),
    
    site = require('../lib/site'),

    port = options.port || 3000,
    testURLs = [],
    server;

 module.exports = function main () {
    var task,
        refs = options.ref;

    startExpress();

    if (refs.indexOf('head') !== -1) {
        refs[refs.indexOf('head')] = "HEAD";
    }

    if (options.sortrefs) {    
        refs.sort();

        if (refs[0] === "HEAD") {
            // Put HEAD at the end.
            refs.push(refs.shift());
        }
    }
    
    refs.forEach(function (ref) {
        task = new Task.create({ref: ref});
        testURLs.push(task.testUrl);
    });

    if (options.results) {
        testURLs.push('/results/');
    }
    
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
    app.get('/task/:taskID/*',  site.task);
    app.get('/assets/*',        site.asset);
    app.get('/benchmark.js',    site.assetBenchmarkjs);
    app.get('/yui3/:taskID/*',  site.assetYui);
    app.get('/results/',        site.results);
    app.get('/results/data.js', site.resultsData);
}

function startYeti () {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function () { /* Nothing? */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    console.log('Listening at http://127.0.0.1:' + port + '\n');

    startBenchmark();
}

function startBenchmark () {
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
}

function handleResult (UA, result) {
    var taskID = result.taskID,
        task = Task.findTaskById(taskID),
        outputPath = options.outputPath;

    console.log("\t" + result.taskID + " = " + result.value);

    result.UA = UA;
    task.result = result;

    // Write to disk
    // fs.writeFileSync(outputPath, JSON.stringify(result, null, 4));  
}