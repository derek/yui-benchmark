/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

YUI.add('benchmark', function (Y, NAME) {
    
    var results = [];

    function YUIBench () { /* Nothing, for now */}

    Y.augment(YUIBench, Y.EventTarget);

    // Set a global for Yeti detection
    Y.config.win.YUIBench = new YUIBench();

    Y.Benchmark = {
        submitValue: function (name, value) {
            addResult({
                name: name,
                value: value
            });

            _sendResult();
        },
        addTest: function (test) {
            if (test instanceof Benchmark ||
                test instanceof Benchmark.Suite || 
                test instanceof Benchmark.Deferred) 
            {
                test.on('complete', function () {
                    for(var i = 0; i < test.length; i++) {
                        addResult({
                            name: this[i].name,
                            value: this[i].hz,
                            stats: this[i].stats
                        });
                    }

                    _sendResult();
                });
            }
            else {
                // Something else?
            }
        }
    }

    function addResult (result) {
        result.taskID = YUI_BENCH_TASKID;
        result.ref = YUI_BENCH_REF;
        results.push(result);
    }

    function _sendResult () {
        // TODO: Figure out a way to not have this be delayed
        Y.later(1000, Y.config.win.YUIBench, function () {
            this.fire('complete', {results: results});
        });
    };
});