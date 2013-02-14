var express = require('express'),
    path = require("path"),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    mime = require('mime'),
    yeti = require('yeti'),
    app;

module.exports = function (config) {
    var // Yeti
        yetiHub = yeti.createHub({loglevel:"silent"}),
        yetiClient,

        // localize config vars
        port = global.port,
        tasks = global.tasks,
        source = global.source,
        yuipath = global.yuipath,
        outputPath = global.outputPath,
        yuiBenchPath = global.yuiBenchPath,
        phantomjs = global.phantomjs,

        // Routes
        site = require('../lib/site'),
        execute = require('../lib/execute'),
        assets = require('../lib/assets'),
        viewer = require('../lib/viewer'),

        results = [];

        // Read in files we'll need
        global.templateHTML = fs.readFileSync(yuiBenchPath + 'assets/template.html', 'utf8');
        global.testHTML = fs.readFileSync(source, 'utf8');
        global.viewerHTML = fs.readFileSync(yuiBenchPath + 'assets/viewer.html', 'utf8');

        // Misc
        global.taskID = 0;
        global.taskCount = tasks.length;

    app = express();

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);

    app.get('/test/:task', execute.task);

    app.get('/benchmark.js', assets.benchmark);
    app.get('/json.js', assets.json);
    app.get('/yui3/*', assets.yui);
    app.get('/assets/*', assets.index);

    app.get('/viewer/', viewer.index);
    app.get('/viewer/data.js', viewer.data);

    // Fire up the HTTP server
    yetiHub.attachServer(app.listen(port));
    console.log('Listening on port ' + port + '\n');

    // Yeti
    yetiClient = yeti.createClient("http://127.0.0.1:3000/yeti/");
    yetiClient.connect(function () {
        // Nothing?
    });

    yetiClient.on('agentConnect', function () {
        var tests = [],
            batch;
        
        tasks.forEach(function (task) {
            tests.push('http://localhost:3000/test/' + task);
        });

        // TODO: Make configurable
        tests.push('http://localhost:3000/viewer/');

        batch = yetiClient.createBatch({
            useProxy: false,
            tests: tests
        });

        batch.on('agentResult', function (UA, result) {
            console.log('\t ' + result.value);
            global.results.push(result);
        });
    });

    if (phantomjs) {
        console.log("Executing tests with PhantomJS");
        spawn(yuiBenchPath + 'scripts/load_url.js', ['http://localhost:3000'], {
            cwd: this.dir
        });
    }
};
