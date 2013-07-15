YUI.add('benchmarkjs-suite', function (Y) {

    var suite = Y.BenchmarkSuite = new Benchmark.Suite();
    var bar = 'bar';
    suite.add('foo', {
        fn: function () {
            // fn
            console.log(bar, 1);
            // /fn
        },
        setup: function () {
            // setup
            console.log(bar, 2);
            // /setup
        }
    });

}, '@VERSION@', {requires: ['datatable']});
