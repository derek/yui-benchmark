var express = require('express'),
    path = require("path"),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    mime = require('mime'),
    app;

module.exports = function (config) {
    var // localize config vars
        port = config.port,
        tasks = config.tasks,
        source = config.source,
        yuipath = config.yuipath,
        outputPath = config.outputPath,
        ybenchpath = config.ybenchpath,
        phantomjs = config.phantomjs,

        taskID = 0,
        taskCount = tasks.length - 1,
        results = [],

        // Read in files we'll need
        templateHTML = fs.readFileSync(ybenchpath + 'assets/template.html', 'utf8'),
        testHTML = fs.readFileSync(source, 'utf8'),
        viewerHTML = fs.readFileSync(ybenchpath + 'assets/viewer.html', 'utf8');

    // Sire up the HTTP server
    app = express();
    app.listen(port);
    app.use(express.bodyParser());

    console.log('Listening on port ' + port);
    console.log('Task list:', tasks, '\n');

    if (phantomjs) {
        console.log("Executing tests with PhantomJS")
        spawn(ybenchpath + 'scripts/load_url.js', ['http://localhost:3000'], {
            cwd: this.dir
        });
    }





// Routes
    app.get('/', function (req, res) {
        res.writeHead(302, {
            'Location': '/execute/' + tasks.shift() + '/',
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end();
    });

    app.get('/execute/:task', function (req, res) {
        var task = req.params.task,
            yuiBase = '/' + task, //version
            html;

        taskID++;
        console.log("[" + taskID + " of " + taskCount + "] Benchmarking: " + task);

        if (task === "end") {

            if (outputPath) {
                console.log('\nFinished! Wrote output to: ' + outputPath);
                fs.writeFileSync(outputPath, JSON.stringify(results, null, 4));   
            }

            res.writeHead(302, {
                'Location': '/viewer/',
                'Content-Type': 'text/html; charset=utf-8'
            });

            console.log('\nDone. Results viewable @ http://localhost:3000/viewer/');
            console.log('\nType ctrl-c to exit.\n');
            
            res.end();
        }
        else {

            if (task !== "yui3") {
                yuiBase = 'http://yui.yahooapis.com/' + task;
            }

            html = templateHTML.replace('{{yuiBase}}', yuiBase).replace('{{body}}', testHTML);

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });
        
            res.end(html);
        }
    });

    app.post('/write', function (req, res) {
        var result = JSON.parse(req.body.result),
            response = JSON.stringify({
                location: '/execute/' + tasks.shift()
            });

        console.log(result.ops);

        results.push(result);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(response);
    });


// Assets
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

    app.get('/yui3/*', function (req, res) {
        var srcPath = path.join(yuipath, '../', req.url);

        res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
        res.end(fs.readFileSync(srcPath, 'utf8'));
    });

    app.get('/assets/*', function (req, res) {
        res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
        res.end(fs.readFileSync(ybenchpath + req.url, 'utf8'));
    });


// Chart viewer
    app.get('/viewer/', function (req, res) {
        var html = templateHTML.replace('{{body}}', viewerHTML).replace(/\{\{yuiBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });

    app.get('/viewer/data.js', function (req, res) {
        var data,
            out = {
                "meta": {
                    "title": "Instantiation",
                    "description": "Sample test"
                },
                "data": []
            };

        results.forEach(function (result) {
            data = {};
            data.category = result.yuiVersion;
            data[result.UA] = result.ops;

            out.data.push(data);
        });

        res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
        res.end('var chart = ' + JSON.stringify(out, null, 4));
    });
};
