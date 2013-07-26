var suite = new Suite({
    name: 'Test suite 03',
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
});
