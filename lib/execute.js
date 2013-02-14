var fs = require("fs")
    util = require('./util');

exports.task = function (req, res) {
    var task = req.params.task,
        yuiBase = '/' + task, //task = YUI version #
        html = util.templateHTML;
    
    console.log("Benchmarking: " + task);

    if (task !== "yui3") {
        yuiBase = 'http://yui.yahooapis.com/' + task;
    }

    html = html.replace('{{yuiBase}}', yuiBase).replace('{{body}}', testHTML);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
};
