/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

YUI.add('bench', function (Y, NAME) {

    function Bench(config) {
        var self = this;
        
        // Set a global for Yeti detection
        Y.config.win.YUIBench = this;
        this.config = config;
        this.results = [];

        if (config.constructor) {
            if (config.constructor === Benchmark.Suite) {
                this.benchmarkjs = new config.constructor(config);
            }
            else if (config.constructor === Benchmark) {
                this.benchmarkjs = new config.constructor(config);
            }
            else if (config.constructor === Benchmark.Deferred) {
                this.benchmarkjs = new config.constructor(config);
            }
        }

        if (this.benchmarkjs) {
            this.benchmarkjs.on('complete', function () {

                for(var i = 0; i < this.length; i++) {
                    self.results.push({
                        taskID: YUI_BENCH_TASKID,
                        ref: YUI_BENCH_REF,
                        component: self.config.component,
                        name: this[i].name,
                        // stats: this[i].stats,
                        value: this[i].hz
                    });
                }

                self._sendResult(self.results);
            });
        }
    }

    // Bench.prototype.setValue = function (val, stats) {
    //     var self = this,
    //         stats = stats || {};
            
    //     self._sendResult({
    //         taskID: YUI_BENCH_TASKID,
    //         ref: YUI_BENCH_REF,
    //         component: self.component,
    //         name: self.name,
    //         value: val,
    //         stats: stats
    //     });
    // };

    Bench.prototype._sendResult = function (results) {

        // TODO: Figure out a way to not have this be delayed
        Y.later(1000, Y.config.win.YUIBench, function () {
            this.fire('result', {
                results: results
            });

            // Figure out a cleaner way. Is there a Yeti event?
            Y.later(500, null, function () {
                console.log('phantomjs:exit');
            })
        });
    };

    Y.augment(Bench, Y.EventTarget);
    
    Y.BenchmarkTest = Bench;
});