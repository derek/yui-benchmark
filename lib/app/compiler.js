/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var fs = require('fs'),
    Handlebars = require('handlebars'),
    mime = require("mime"),
    path = require('path');

function templateToHTML (values, templateSrc) {
    var templatePath = path.join(__dirname, '../assets/', templateSrc),
        template;

    templateSrc = fs.readFileSync(templatePath, 'utf8');

    template = Handlebars.compile(templateSrc);

    return template(values);
}

function normalize (suite) {
    /*
    Error checking ideas:
        - needs name
        - yui/dojo require certain properties
    */
    suite.benchmarkjsURL = suite.benchmarkjsURL || 'http://rawgithub.com/bestiejs/benchmark.js/a421927f4075716355e5eb45b4bd905bb8011b80/benchmark.js',
    suite.name = String(suite.name);
    suite.slug = suite.slug || suite.name;
    suite.slug = suite.slug.replace(/[^A-Za-z0-9\-\s]/g, '').replace(/\s/g, '-').toLowerCase();
    suite.description = String(suite.description || '');
    suite.html = String(suite.html || '');
    suite.readyCount = 0;
    suite.assets = suite.assets || [];
    suite.bottomHTML = suite.bottomHTML || '';
    suite.global = suite.global || {};

    suite.tests = suite.tests.map(function (test) {
        return {
            name: String(test.name),
            defer: String(Boolean(test.async)),
            setup: String(test.setup || suite.global.setup || null),
            // onStart: String(test.onStart || suite.global.onStart || null),
            // onCycle: String(test.onCycle || suite.global.onCycle || null),
            // onComplete: String(test.onComplete || suite.global.onComplete || null),
            teardown: String(test.teardown || suite.global.teardown || null),
            fn: String(test.fn)
        };
    });

    if (suite.yui) {
        if (Boolean(suite.yui) === suite.yui) {
            suite.yui = {};
        }
        suite.yui.config = (suite.yui.config || {});
        suite.yui.use = (suite.yui.use || []);
        suite.yui.setup = (suite.yui.setup || '');
        suite.yui.version = (suite.yui.version || '3.10.3');
        suite.yui.src = (suite.yui.src || 'http://yui.yahooapis.com/' + suite.yui.version + '/build/yui/yui-min.js');
        suite.bottomHTML += templateToHTML({
            src: suite.yui.src,
            config: JSON.stringify(suite.yui.config),
            modules: ("'" + suite.yui.use.join("', '") + "'")
        }, 'libraries/yui.handlebars');
        suite.readyCount++;
    }

    if (suite.jquery) {
        if (Boolean(suite.jquery) === suite.jquery) {
            suite.jquery = {};
        }
        suite.jquery.version = (suite.jquery.version || '2.0.2');
        suite.jquery.src = (suite.jquery.src || 'http://ajax.googleapis.com/ajax/libs/jquery/' + suite.jquery.version + '/jquery.min.js');
        suite.bottomHTML += templateToHTML({
            src: suite.jquery.src
        }, 'libraries/jquery.handlebars');
    }

    if (suite.dojo && suite.dojo.require) {
        if (Boolean(suite.dojo) === suite.dojo) {
            suite.dojo = {};
        }
        suite.dojo.version = (suite.dojo.version || '1.9.1');
        suite.dojo.src = (suite.dojo.src || 'http://ajax.googleapis.com/ajax/libs/dojo/' + suite.dojo.version + '/dojo/dojo.js');
        suite.dojo.exportAs = (suite.dojo.exportAs || []);
        suite.dojo.exportString = '';
        suite.dojo.exportAs.forEach(function(v) {
            suite.dojo.exportString += ('window.' + v + ' = ' + v + ';\n');
        });
        suite.bottomHTML += templateToHTML({
            src: suite.dojo.src,
            exportString: suite.dojo.exportString,
            require: JSON.stringify(suite.dojo.require),
            exportAs: suite.dojo.exportAs.join(', ')
        }, 'libraries/dojo.handlebars');
        suite.readyCount++;
    }

    suite.readyCount++;
    suite.topHTML = '<!-- Test HTML -->' + suite.html + '<!-- End Test HTML -->';
    suite.bottomHTML = '<!-- bottomHTML -->' + suite.bottomHTML + '<!-- End bottomHTML -->';

    return suite;
}

function compile (suite, sourceDir, templateSrc) {
    suite = normalize(suite);
    templateSrc = (templateSrc || 'runner.handlebars');

    return {
        name: suite.slug + '.html',
        html: templateToHTML(suite, templateSrc),
        assets: suite.assets.map(function (asset) {
            return {
                name: path.basename(path.join(sourceDir, asset)),
                mime: mime.lookup(path.join(sourceDir, asset)),
                content: fs.readFileSync(path.join(sourceDir, asset), 'utf-8')
            };
        })
    };
}

module.exports = compile;
