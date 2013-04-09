/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
    useragent = require('useragent'),
    util = require('./util'),
    Task = require('./task'),
    log = require('./log'),
    options = require('./options'),
    yuiBenchPath = util.yuiBenchPath,
    templateHTML = fs.readFileSync(yuiBenchPath + 'assets/template.html', 'utf8'),
    testHTML;

/**
 * Serves a redirect to Yeti
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.index = function (req, res) {
    res.writeHead(302, { 'Location': '/yeti/' });
    res.end();
};

/**
 * Serves an HTML document containing the tests for a given task instance
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.task = function (req, res) {
    var taskID = req.params.taskID,
        task = util.findTaskById(taskID),
        agent = (useragent.parse(req.headers['user-agent'])).toString().split(' ')[0],
        html,
        scripts = [],
        seedCount = task.tests.length;

    scripts.push('<script src="/yeti/public/inject.js"></script>');
    scripts.push('<script src="/yui/build/yui/yui.js"></script>');
    task.tests.forEach(function (test) {
        scripts.push('<script src="' + test.seedBase + '/build/yui/yui.js"></script>');
    });

    html = templateHTML.replace('{{body}}', task.source.html.body)
            .replace('{{head}}', scripts.join('\n'))
            .replace(/\{\{seedCount\}\}/g, seedCount)
            .replace('{{taskID}}', taskID)
            .replace('{{css}}', '');

    log.info("Serving task " + taskID + " to " + agent);

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

/**
 * Serves asset files
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.asset = function (req, res) {
    res.writeHead(200, {'Content-Type': mime.lookup(req.url) + '; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + req.url, 'utf8'));
};

/**
 * Serves benchmark.js
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.benchmarkjs = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + 'node_modules/benchmark/benchmark.js', 'utf8'));
};

/**
 * Serves yui-benchmark.js
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.yuibenchmarkjs = function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end(fs.readFileSync(yuiBenchPath + 'assets/yui-benchmark.js', 'utf8'));
};

/**
 * Serves unwrapped YUI files
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.bareYUI = function (req, res) {
    var srcPath = path.join(options.yuipath, '/build/', req.params[0]),
        fileContents = fs.readFileSync(srcPath, 'utf8');

    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(fileContents);
};

/**
 * Serves a wrapped YUI module containing the test source
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.wrappedTest = function (req, res) {
    var taskID = req.params.taskID,
        testID = req.params.testID,
        task = util.findTaskById(taskID),
        test = task.tests[testID],
        instanceName = 'YUI' + testID,
        src;

    if (req.params[0] === 'yui-benchmark.js') {
        src = fs.readFileSync(yuiBenchPath + '/assets/yui-benchmark.js', 'utf8')
    }
    else {
        src = task.source.javascript
    }

    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    src = '(function (YUI) {\n\n' + src + '\n\n}(' + instanceName + '))';
    res.end(src);
};

/**
 * Serves wrapped YUI files
 *
 * @public
 * @param {Object} An HTTP request object
 * @param {Object} An HTTP response object
 */
exports.wrappedYUI = function (req, res) {
    var taskID = req.params.taskID,
        testID = req.params.testID,
        ref = req.params.ref,
        task = util.findTaskById(taskID),
        test = task.findTestById(testID),
        srcPath = path.join(test.repository, req.params[0]),
        fileContents = fs.readFileSync(srcPath, 'utf8'),
        instanceName = 'YUI' + (ref === 'WIP' ? '' : testID),
        modulePath = test.moduleURL,
        args = {
            instanceName: instanceName,
            name: task.meta.name,
            modulePath: modulePath,
            testID: testID,
            taskID: taskID,
            sha: test.sha,
            ref: test.ref,
            seedBase: test.seedBase,
            wip: options.wip
        },
        wrapped = '',

        /* Borrowed from yui3/src/yui/yui.js */
        _BASE_RE = /(?:\?(?:[^&]*&)*([^&]*))?\b(simpleyui|yui(?:-\w+)?)\/\2(?:-(min|debug))?\.js/;

    /* If this is the seed */
    if (_BASE_RE.test(req.url)) {
        wrapped += 'var ' + instanceName + ' = (function (win) {\n\n';
        wrapped += fileContents + '\n\n';
        wrapped += 'win.registerYUI(YUI, ' + JSON.stringify(args) + ');\n';
        wrapped += 'return YUI;\n';
        wrapped += '}(window))';
    }
    else {
        wrapped += '(function (YUI) {\n';
        wrapped += fileContents + '\n';
        wrapped += '}(' + instanceName + '));';
    }

    res.writeHead(200, {'Content-Type': mime.lookup(srcPath) + '; charset=utf-8'});
    res.end(wrapped);
};

/*
exports.results = function (req, res) {
    var seedBase = path.join('/', 'yui3', 'WIP'), // TODO : seedBase should pull from local dev branch
        html = util.templateHTML
                .replace('{{body}}', util.viewerHTML)
                .replace('{{head}}', '')
                .replace(/\{\{seedBase\}\}/g, seedBase)
                .replace('{{taskID}}', '')
                .replace('{{ref}}', '')
                .replace('{{css}}', '#chart {height:85%;width:95%;}');

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};
*/

/*
exports.resultsData = function (req, res) {
    var tasks = Task.tasks,
        resultsByRef = {},
        out = {
            "meta": {},
            "data": []
        },
        data,
        ref,
        set,
        results = [];

    if (options.datapath) {
        data = require(tasks[0].meta.outputPath);
        data.results.forEach(function (result) {
            results.push(result);
        });
    }

    tasks.forEach(function (task) {
        task.results.forEach(function (result) {
            results.push(result);
        });
    });
    
    out.meta.component = results[0].component;
    out.meta.name = results[0].name;

    results.forEach(function (result) {
        out.data.push({
            ref: result.ref.substring(0, 10),
            UA: result.UA,
            value: result.value
        });
    });

    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end('var chart = ' + JSON.stringify(out, null, 4));
};
*/
