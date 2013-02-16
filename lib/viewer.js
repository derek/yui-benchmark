/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var util = require('./util');

exports.index = function (req, res) {
    var html = util.templateHTML.replace('{{body}}', util.viewerHTML).replace(/\{\{seedBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};

exports.data = function (req, res) {
    var data,
        results = global.results,
        out = {
            "meta": {
                "component": null,
                "name": null
            },
            "data": []
        };

    for (var version in results) {
        data = {};
        data.category = version.substring(0, 6);
        results[version].forEach(function (set) {
            data[set.UA] = set.value;
        });

        out.data.push(data);

        // Move these two assignments outside the loop
        out.meta.component = results[version][0].component;
        out.meta.name = results[version][0].name;
    }

    res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8'
    });

    res.end('var chart = ' + JSON.stringify(out, null, 4));
};