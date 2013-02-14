var fs = require("fs");

exports.task = function (req, res) {
    var task = req.params.task,
        yuiBase = '/' + task, //version
        html,
        taskCount = global.taskCount,
        outputPath = global.outputPath,
        tasks = global.tasks,
        output = global.output;
    
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

        global.taskID++;
        
        console.log("[" + global.taskID + " of " + taskCount + "] Benchmarking: " + task);

        if (task !== "yui3") {
            yuiBase = 'http://yui.yahooapis.com/' + task;
        }

        html = templateHTML.replace('{{yuiBase}}', yuiBase).replace('{{body}}', testHTML);

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });
    
        res.end(html);
    }
};
