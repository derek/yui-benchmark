var express = require('express'),
    fs = require("fs"),
    Benchmark = require('benchmark'),
    microtime = require('microtime');


module.exports = function (config) {

    var // localize config vars
    	port = config.port,
        tasks = config.tasks,
        source = config.source,
        yuipath = config.yuipath,
        outputPath = config.outputPath,
        ybenchpath = config.ybenchpath,

        taskID = 1,
        taskCount = tasks.length - 1,
        results = [],

        // Read in files we'll need
        templateHTML = fs.readFileSync(ybenchpath + 'assets/template.html', 'utf8'),
        bodyHTML = fs.readFileSync(source, 'utf8'),

        // Boot up the HTTP server
        app = express();

    app.use(express.bodyParser());

    app.get('/', function (req, res) {

        res.writeHead(302, {
            'Location': '/execute/' + tasks.shift() + '/',
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end();
    });

    app.get('/execute/:version/', function (req, res) {

        var version = req.params.version,
            seed,
            html;

        console.log("[" + taskID + " of " + taskCount + "] Benchmarking: " + version);

        taskID++;

        switch (version) {
            case "master":
                seed = '/master/build/yui/yui.js';
                break;
            default:
                seed = 'http://yui.yahooapis.com/' + version + '/build/yui/yui-min.js';
                break;
        }

        html = templateHTML.replace('{{seed}}', seed).replace('{{body}}', bodyHTML);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(html);
    });

    app.get('/end/', function (req, res) {
        console.log('\nFinished! Wrote output to: ' + outputPath);

        fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });
        res.end("<h1>Done!</h1>");

        console.log('\nGoodbye.\n');
        process.exit();
    });

    app.post('/write', function (req, res) {
        var result = JSON.parse(req.body.result),
            userAgent = req['user-agent'],
            response = JSON.stringify({
                version: tasks.shift()
            });

        results.push(result);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });
        res.end(response);
    });

    app.get('/benchmark.js', function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        res.end(fs.readFileSync(ybenchpath + 'node_modules/benchmark/benchmark.js', 'utf8'));
    });

    app.get('/json.js', function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        res.end(fs.readFileSync(ybenchpath + 'node_modules/JSON2/json2.js', 'utf8'));
    });

    app.get('/master/*', function (req, res) {
        var path = yuipath + "/" + req.url.replace('/master/', ''),
            src = fs.readFileSync(path, 'utf8');

        res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        res.end(src);
    });

    app.get('/assets/*', function (req, res) {
        var src = fs.readFileSync(ybenchpath + req.url, 'utf8');

        res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        res.end(src);
    });

    app.listen(port);
    console.log('Listening on port ' + port);
    console.log('Task list:', tasks, '\n');
};
