var suite = new PerfSuite('Node Attributes', {
    html: 'dom.html',
    jquery: true,
    yui: {
        use: ['node']
    },
    dojo: {
        require: ['dojo/query'],
        exportAs: ['query']
    },
    global: {
        setup: function () {
            var selectors = ['body', 'li:first-child'];
        }
    }
});

suite.add('jQuery', function () {
    for (var sel in selectors) {
        $(sel);
    }
});

suite.add('YUI', function () {
    for (var sel in selectors) {
        Y.one(sel);
    }
});

suite.add('Dojo', function () {
    for (var sel in selectors) {
        query(sel);
    }
});