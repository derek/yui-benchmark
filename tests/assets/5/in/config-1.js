var suite = new PerfSuite({
    name: 'Test suite 01',
    assets: ['assets/foo.html'],
    tests: [
        {
            name: 'timeout = 0',
            async: true,
            fn: function (deferred) {
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
            }
        }
    ]
});
