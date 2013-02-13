var express = require('express'),
    path = require("path"),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    mime = require('mime'),
    app;

module.exports = function (config) {
    var // localize config vars
        port = global.port,
        tasks = global.tasks,
        source = global.source,
        yuipath = global.yuipath,
        outputPath = global.outputPath,
        ybenchpath = global.ybenchpath,
        phantomjs = global.phantomjs,

        // Routes
        site = require('../lib/site'),
        execute = require('../lib/execute'),
        assets = require('../lib/assets'),
        viewer = require('../lib/viewer'),

        results = [];

        // Read in files we'll need
        global.templateHTML = fs.readFileSync(ybenchpath + 'assets/template.html', 'utf8');
        global.testHTML = fs.readFileSync(source, 'utf8');
        global.viewerHTML = fs.readFileSync(ybenchpath + 'assets/viewer.html', 'utf8');

        // Misc
        global.taskID = 0;
        global.taskCount = tasks.length;

    app = express();

    // Middleware
    app.use(express.bodyParser());

    // Routes
    app.get('/', site.index);

    app.get('/execute/:task', execute.task);
    app.post('/write', execute.write);

    app.get('/benchmark.js', assets.benchmark);
    app.get('/json.js', assets.json);
    app.get('/yui3/*', assets.yui);
    app.get('/assets/*', assets.index);

    app.get('/viewer/', viewer.index);
    app.get('/viewer/data.js', viewer.data);

    // Fire it up
    app.listen(port);
    console.log('Listening on port ' + port);

    if (phantomjs) {
        console.log("Executing tests with PhantomJS");
        spawn(ybenchpath + 'scripts/load_url.js', ['http://localhost:3000'], {
            cwd: this.dir
        });
    }
};
