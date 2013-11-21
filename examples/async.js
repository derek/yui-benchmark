var suite = new PerfSuite('Async tests', {
    tests: [{
        name: 'Half second timout',
        async: true,
        fn: function (deferred) {
            setTimeout(function() {
                deferred.resolve();
            }, 500);
        }
    },{
        name: 'One second timeout',
        async: true,
        fn: function (deferred) {
            setTimeout(function() {
                deferred.resolve();
            }, 1000);
        }
    }]
});
