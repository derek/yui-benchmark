var suite = new PerfSuite({
    name: 'Simple test',
    tests: [
        {
            name: 'New Array',
            fn: function () {
                var arr = new Array();
            }
        }
    ]
});
