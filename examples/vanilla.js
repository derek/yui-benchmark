var suite = new PerfSuite({
    name: 'Simple test',
    tests: [
        {
            name: 'new Array()',
            fn: function () {
                var arr = new Array();
            }
        },
        {
            name: '[]',
            fn: function () {
                var arr = [];
            }
        }
    ]
});
