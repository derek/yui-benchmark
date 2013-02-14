var util = require('./util');

exports.index = function (req, res) {
    var html = util.templateHTML.replace('{{body}}', util.viewerHTML).replace(/\{\{yuiBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

exports.data = function (req, res) {
    var data,
        out = {
            "meta": {
                "component": null,
                "name": null
            },
            "data": []
        };

    results.forEach(function (result) {
        data = {};
        data.category = result.yuiVersion;
        data[result.UA] = result.value;

        out.meta.component = result.component;
        out.meta.name = result.name;
        out.data.push(data);
    });

    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    res.end('var chart = ' + JSON.stringify(out, null, 4));
};