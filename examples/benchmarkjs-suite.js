module.exports = [
    {
        title: 'Smallest timeout value',
        snippets: [
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
        assets: ['tests/assets/ok.txt']
    },
    {
        title: 'Smallest timeout value',
        snippets: [
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
