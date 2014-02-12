var suite = new PerfSuite({
    name: 'Test suite 02',
    description: 'Tests basic library inclusion',
    jquery: true,
    yui: {
        use: ['node']
    },
    dojo: {
        require: ['dojo/query'],
        exportAs: ['query']
    },
    tests: [
        {
            name: 'test 3',
            fn: function () {
                var foo = 'foo';
            }
        }
    ]
});
