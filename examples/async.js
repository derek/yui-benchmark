var suite = new PerfSuite('Async tests', {
    tests: [{
        name: 'Half second',
        async: true,
        fn: function (deferred) {
            setTimeout(function() {
                deferred.resolve();
            }, 500);
        }
    },{
        name: '1 second',
        async: true,
        fn: function (deferred) {
            setTimeout(function() {
                deferred.resolve();
            }, 1000);
        }
    }]
});
