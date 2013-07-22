[
    {
        title: 'Test suite 01',
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
    },
    {
        title: 'Test suite 02',
        description: 'Tests basic library inclusion',
        jquery: true,
        dojo: true,
        yui: true,
        tests: [
            {
                title: 'test 3',
                fn: function () {
                    var foo = 'foo';
                }
            }
        ]
    },
    {
        title: 'Test suite 03',
        description: 'Tests advanced library inclusion',
        jquery: {
            version: '2.0.0'
        },
        yui: {
            version: '3.9.0',
            use: ['node']
        },
        dojo: {
            version: '1.8.0',
            require: ["dojo/query", "dojo/dom-construct"],
            exportAs: ['query', 'domConst']
        },
        tests: [
            {
                title: 'test 4',
                fn: function () {
                    var foo = 'foo';
                }
            }
        ]
    }
];