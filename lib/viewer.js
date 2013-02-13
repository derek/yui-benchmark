exports.index = function (req, res) {
    var templateHTML = global.templateHTML,
        viewerHTML = global.viewerHTML,
        html = templateHTML.replace('{{body}}', viewerHTML).replace(/\{\{yuiBase\}\}/g, 'http://yui.yahooapis.com/3.8.0');

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
};

exports.data = function (req, res) {
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
};