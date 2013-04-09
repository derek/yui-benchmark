/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
YUI.add('yui-benchmark', function (Y, NAME) {

    /** 
     * Y.Benchmark constructor
     *
     */
    function YBenchmark() { 
        YBenchmark.superclass.constructor.apply(this, arguments);
    }

    Y.extend(YBenchmark, Y.EventTarget, {

        /** An array of results */
        results: [],

        /** 
         * Adds a result onto this instance's results set
         * 
         * @param {Object} An object of test results 
         */
        addResult: function (result) {
            this.results.push(result);
        },

        /** 
         * Broadcasts the `results` event to anyone listening (aka: Yeti)
         *
         */
        broadcastResults: function () {
            Y.log('Sending results');
            this.fire('results', {results: this.results});
        }
    }, {

        // Static properties

        /**
         * 
         *
         * @property sha
         * @type String
         * @default null
         * @static
         */
        sha: null,

        /**
         * 
         *
         * @property ref
         * @type String
         * @default null
         * @static
         */
        ref: null,

        /**
         * 
         *
         * @property taskID
         * @type Number
         * @default null
         * @static
         */
        taskID: null,

        /**
         * 
         *
         * @property testID
         * @type Number
         * @default null
         * @static
         */
        testID: null,

        /**
         * 
         *
         * @type Function
         * @static
         * @params {String} Name of this test
         * @params {String} The value to record
         * @params {String} The unit of measurement (e.g. FPS, Hz)
         */
        submitValue: function (name, value, unit) {
            if (name === undefined) {
                throw new Error("submitValue: Name required");
            }

            if (value === undefined) {
                throw new Error("submitValue: Value required");
            }

            if (unit === undefined) {
                unit = '';
            }
            
            var benchmark = window.YUIBenchmark;

            benchmark.addResult({
                unit: unit,
                name: name,
                value: value,
                ref: this.ref,
                sha: this.sha,
                testID: this.testID,
                taskID: this.taskID,
                stats: {
                    rme: 0
                }
            });

            benchmark.broadcastResults();
        }
    });

    /** Export it */
    Y.Benchmark = YBenchmark;

}, '@VERSION', {
	requires: ['event', 'oop']
});
