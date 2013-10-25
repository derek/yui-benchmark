var suite = new PerfSuite({
    name: 'Test suite 01',
    assets: [
        'assets/foo.html',
        'require/bar.html'
    ],
    tests: [
        {
            name: 'timeout = 0',
            async: true,
            fn: function (deferred) {
                var require = ['kamen', 'rider'];
                setTimeout(function() {
                    console.log(require);
                    deferred.resolve();
                }, 0);
            }
        }
    ]
});
