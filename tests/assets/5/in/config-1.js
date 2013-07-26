var suite = new Suite({
    name: 'Test suite 01',
    assets: ['assets/foo.html'],
    tests: [
        {
            title: 'timeout = 0',
            async: true,
            fn: function (deferred) {
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
            }
        }
    ]
});
