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

suite.add('jQuery - DOM Selection', function () {
    for (var sel in selectors) {
        $(sel);
    }
});

suite.add('YUI - DOM Selection', function () {
    for (var sel in selectors) {
        Y.one(sel);
    }
});

suite.add('Dojo - DOM Selection', function () {
    for (var sel in selectors) {
        query(sel);
    }
});