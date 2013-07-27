var suite = new PerfSuite({
    name: 'Smallest timeout value',
    assets: ['assets/ok.txt'],
    tests: [
        {
            name: 'timeout = 0',
            async: true,
            fn: function (deferred) {
                // async test
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
            }
        },
        {
            name: 'timeout = 1',
            async: true,
            fn: function (deferred) {
                // async test
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
            }
        }
    ]
});