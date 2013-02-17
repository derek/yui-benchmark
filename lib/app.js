/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var express = require('express'),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    mime = require('mime'),
    yeti = require('yeti'),
    async = require('async'),
    util = require('./util'),
    options = require('./opts'),
    Task = require('./task'),
    app;

module.exports = function (config) {

    var // Yeti
        yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient,

        // localize config vars
        port = config.port,
        source = config.source,
        phantomjs = config.phantomjs,

        // localize options
        yuiPath = options.yuipath,
        outputPath = options.outputPath,
        yuiBenchPath = util.yuiBenchPath,

        // Routes
        site = require('../lib/site'),
        execute = require('../lib/execute'),
        assets = require('../lib/assets'),
        viewer = require('../lib/viewer');

        asyncJobs = [],

        testURLs = [];

    app = express();

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);
    app.get('/task/:taskID', execute.task);
    app.get('/benchmark.js', assets.benchmark);
    app.get('/yui3/:taskID/*', assets.yui);
    app.get('/assets/*', assets.index);
    app.get('/results/', viewer.index);
    app.get('/results/data.js', viewer.data);

    asyncJobs = Task.tasks.map(function (task) {
        testURLs.push(task.testUrl);
        return (function (task) {
            return function (callback) {
                task.init(callback);
            };
        }(task));
    });

    // TODO: Make configurable
    testURLs.push('/results/');

    async.parallel(asyncJobs, startYeti);







    function startYeti () {
        console.log("Yeti time!");

        // Fire up the HTTP server
        yetiHub.attachServer(app.listen(port));
        console.log('Listening on port ' + port + '\n');

        // Yeti
        yetiClient = yeti.createClient("http://127.0.0.1:3000/yeti/");
        yetiClient.connect(function () { /* Nothing? */ });

        yetiClient.on('agentConnect', yetiOnAgentConnect);

        if (phantomjs) {
            console.log("Executing tasks with PhantomJS");
            spawn(yuiBenchPath + 'scripts/load_url.js', ['http://localhost:3000'], {
                cwd: this.dir
            });
        }
    }

    function yetiOnAgentConnect(UA) {
        console.log("Agent connected: " + UA);
        var batch = yetiClient.createBatch({
            useProxy: false,
            tests: testURLs
        });

        batch.on('agentResult', yetiOnAgentResult);
    }

    function yetiOnAgentResult (UA, result) {
        var taskID = result.taskID,
            task = Task.findTaskById(taskID);

        console.log("\t" + result.taskID + " = " + result.value);

        result.UA = UA;
        task.result = result;

        // Write to disk
        // fs.writeFileSync(outputPath, JSON.stringify(result, null, 4));  
    }
};
