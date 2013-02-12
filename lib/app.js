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

        taskID = 0,
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
            yuiBase = '/' + version,
            html;

        taskID++;
        console.log("[" + taskID + " of " + taskCount + "] Benchmarking: " + version);

        if (version !== "master") {
            yuiBase = 'http://yui.yahooapis.com' + yuiBase;
        }

        html = templateHTML.replace('{{yuiBase}}', yuiBase).replace('{{body}}', bodyHTML);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(html);
    });

    app.get('/end/', function (req, res) {
        console.log('\nFinished! Wrote output to: ' + outputPath);

        fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));

        res.writeHead(302, {
            'Location': '/viewer/',
            'Content-Type': 'text/html; charset=utf-8'
        });

        console.log('\nGoodbye.\n');
        setTimeout(function () {
            process.exit();
        }, 1000);

        res.end();
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
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(fs.readFileSync(ybenchpath + req.url, 'utf8'));
    });

    app.get('/viewer/', function (req, res) {
        var html = fs.readFileSync(ybenchpath + 'assets/viewer.html', 'utf8');
        html = html.replace('{{yuiBase}}', 'http://yui.yahooapis.com/3.8.0');

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });

    app.get('/viewer/data.js', function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        var out = {
            "meta": {
                "title": "Instantiation",
                "description": "Sample test"
            },
            "data": []
        };

        results.forEach(function (result) {
            out.data.push({
                "category" : result.yuiVersion,
                "phantomjs1.7": result.ops
            });
        });

        res.end('var chart = ' + JSON.stringify(out));
    });

    app.listen(port);
    console.log('Listening on port ' + port);
    console.log('Task list:', tasks, '\n');
};
