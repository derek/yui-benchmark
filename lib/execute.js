var fs = require("fs")
    util = require('./util');

exports.task = function (req, res) {
    var task = req.params.task,
        yuiBase = '/' + task, //task = YUI version #
        html = util.templateHTML,
        outputPath = global.outputPath;
    
    if (task == "undefined") {

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
        
        console.log("Benchmarking: " + task);

        if (task !== "yui3") {
            yuiBase = 'http://yui.yahooapis.com/' + task;
        }

        html = html.replace('{{yuiBase}}', yuiBase).replace('{{body}}', testHTML);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });
    
        res.end(html);
    }
};
