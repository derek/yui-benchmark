/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/**
 * YUI Benchmark is a module that exports Y.Benchmark, which is used to coallate
 * and broadcast results to Yeti.
 *
 * @module yui-benchmark
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
            var complete = Y.config.win.yetiComplete;

            Y.log('Sending results');

            if (complete) {
                complete({
                    results: this.results
                });
            }
        },

        /**
         *
         */
        serverLog: function (message) {
            Y.io('/log/', {
                method: 'POST',
                data: 'message=' + message
            });
        }
    }, {
        /** Static properties */

        /**
         * The seed's Git ref this test is benchmarking
         *
         * @property ref
         * @type String
         * @default null
         * @static
         */
        ref: null,

        /**
         * SHA-1 hash of the seed's Git ref this test is benchmarking
         *
         * @property sha
         * @type String
         * @default null
         * @static
         */
        sha: null,

        /**
         * The Task ID this test is benchmarking
         *
         * @property taskID
         * @type Number
         * @default null
         * @static
         */
        taskID: null,

        /**
         * The Test ID this test is benchmarking
         *
         * @property testID
         * @type Number
         * @default null
         * @static
         */
        testID: null,

        /**
         * A function used to broadcast results to Yeti (or anything else listening)
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
	requires: ['event', 'oop', 'io-base']
});
