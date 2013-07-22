[
    {
        title: 'Smallest timeout value',
        tests: [
            {
                title: 'timeout = 0',
                async: true,
                fn: function (deferred) {
                    // async test
                    setTimeout(function() {
                        deferred.resolve();
                    }, 0);
                }
            }
        ],
        assets: ['assets/ok.txt']
    },
    {
        title: 'Smallest timeout value',
        tests: [
            {
                title: 'timeout = 0',
                async: true,
                fn: function (deferred) {
                    // async test
                    setTimeout(function() {
                        deferred.resolve();
                    }, 0);
                }
            }
        ]
    }
];
