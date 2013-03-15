/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

YUI.add('benchmark', function (Y, NAME) {

    function YUIBench () { /* Nothing, for now */}

    Y.augment(YUIBench, Y.EventTarget);

    // Set a global for Yeti detection
    Y.config.win.YUIBench = new YUIBench();

    Y.Benchmark = {
        addTest: function (test) {
            if (test instanceof Benchmark ||
                test instanceof Benchmark.Suite || 
                test instanceof Benchmark.Deferred) 
            {
                test.on('complete', onComplete);
            }
            else {
                // Something else?
            }
        },
        submitValue: function (val) {
            console.log('I got' + val);
        }
    }

    function onComplete () {
        var test = this,
            results = [],
            i;
        
        for(i = 0; i < test.length; i++) {
            results.push({
                taskID: YUI_BENCH_TASKID,
                ref: YUI_BENCH_REF,
                name: test[i].name,
                // component: config.component,
                // stats: this[i].stats,
                value: test[i].hz
            });
        }

        _sendResult(results);
    }

    function _sendResult (results) {
        // TODO: Figure out a way to not have this be delayed
        Y.later(1000, Y.config.win.YUIBench, function () {
            this.fire('complete', {results: results});
        });
    };
});