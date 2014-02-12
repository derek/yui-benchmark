var suite = new PerfSuite({
    name: 'Test suite 01',
    html: 'assets/foo.html',
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
