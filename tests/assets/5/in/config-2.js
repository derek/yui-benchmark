var suite = new Suite({
    name: 'Test suite 02',
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
});
