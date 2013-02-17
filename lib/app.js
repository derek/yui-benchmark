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
    assets = require('../lib/assets'),
    viewer = require('../lib/viewer'),
    execute = require('../lib/execute'),

    port = options.port || 3000,
    testURLs = [],
    server;

 module.exports = function main () {
    var task;

    startExpress();

    options.ref.forEach(function (ref) {
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
    app.get('/', site.index);
    app.get('/task/:taskID/*', execute.task);
    app.get('/assets/*', assets.index);
    app.get('/benchmark.js', assets.benchmark);
    app.get('/yui3/:taskID/*', assets.yui);
    app.get('/results/', viewer.index);
    app.get('/results/data.js', viewer.data);
}

function startYeti () {
    var yetiHub = yeti.createHub({loglevel:"silent"}),
        phantomjs = options.phantomjs || false,
        yetiClient;

    yetiHub.attachServer(server);

    yetiClient = yeti.createClient("http://127.0.0.1:" + port + "/yeti/");
    yetiClient.connect(function () { /* Nothing? */ });
    yetiClient.on('agentConnect', handleAgentConnect);

    console.log('Listening at http://127.0.0.1:' + port + '\n');

    if (phantomjs) {
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