var express = require('express'),
    fs = require("fs"),
    Benchmark = require('benchmark'),
    microtime = require('microtime'),
    useragent = require('useragent');


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
        testHTML = fs.readFileSync(source, 'utf8'),
        viewerHTML = fs.readFileSync(ybenchpath + 'assets/viewer.html', 'utf8'),

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

        html = templateHTML.replace('{{yuiBase}}', yuiBase).replace('{{body}}', testHTML);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(html);
    });

    app.post('/write', function (req, res) {
        var result = JSON.parse(req.body.result),
            ua = useragent.parse(req.headers['user-agent']),
            response = JSON.stringify({
                version: tasks.shift()
            });

        result.userAgent = ua.toString();

        results.push(result);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });
        res.end(response);
    });

    app.get('/end/', function (req, res) {
        if (outputPath) {
            console.log('\nFinished! Wrote output to: ' + outputPath);
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));   
        }

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
        var html = templateHTML.replace('{{body}}', viewerHTML).replace(/\{\{yuiBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });

    app.get('/viewer/data.js', function (req, res) {
        var agent = useragent.parse(req.headers['user-agent']),
            uaString = agent.toString(),
            data;

        res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
        var out = {
            "meta": {
                "title": "Instantiation",
                "description": "Sample test"
            },
            "data": []
        };

        results.forEach(function (result) {

            data = {};
            data.category = result.yuiVersion;
            data[uaString] = result.ops;

            out.data.push(data);
        });

        res.end('var chart = ' + JSON.stringify(out, null, 4));
    });

    app.listen(port);
    console.log('Listening on port ' + port);
    console.log('Task list:', tasks, '\n');
};
