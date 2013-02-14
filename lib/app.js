var express = require('express'),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    mime = require('mime'),
    yeti = require('yeti'),
    util = require('./util'),
    app;

module.exports = function (config) {

    var // Yeti
        yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient,

        // localize config vars
        port = config.port,
        tasks = config.tasks,
        source = config.source,
        phantomjs = config.phantomjs,

        // localize globals
        yuiPath = global.yuipath,
        outputPath = global.outputPath,
        yuiBenchPath = util.yuiBenchPath,

        // Routes
        site = require('../lib/site'),
        execute = require('../lib/execute'),
        assets = require('../lib/assets'),
        viewer = require('../lib/viewer');

        // Read in files we'll need
        global.testHTML = fs.readFileSync(source, 'utf8');

    app = express();

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);

    app.get('/task/:task', execute.task);

    app.get('/benchmark.js', assets.benchmark);
    app.get('/yui3/*', assets.yui);
    app.get('/assets/*', assets.index);

    app.get('/results/', viewer.index);
    app.get('/results/data.js', viewer.data);

    // Fire up the HTTP server
    yetiHub.attachServer(app.listen(port));
    console.log('Listening on port ' + port + '\n');

    // Yeti
    yetiClient = yeti.createClient("http://127.0.0.1:3000/yeti/");
    yetiClient.connect(function () {
        // Nothing?
    });

    yetiClient.on('agentConnect', function (UA) {
        console.log("Agent connected: " + UA);
        var tests = [],
            batch;
        
        tasks.forEach(function (task) {
            tests.push('http://localhost:3000/task/' + task);
        });

        // TODO: Make configurable
        tests.push('http://localhost:3000/results/');

        batch = yetiClient.createBatch({
            useProxy: false,
            tests: tests
        });

        batch.on('agentResult', function (UA, result) {
            console.log(result.value);
            global.results.push(result);

            // Write to disk
            // fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));  
        });
    });

    if (phantomjs) {
        console.log("Executing tests with PhantomJS");
        spawn(yuiBenchPath + 'scripts/load_url.js', ['http://localhost:3000'], {
            cwd: this.dir
        });
    }
};
