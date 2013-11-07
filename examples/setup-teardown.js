var suite = new PerfSuite('Node Selection', {
    html: 'assets/node-attrs.html',
    yui: {
        use: ['node-base']
    }
});

suite.add({
    name: 'node.get("text")',
    setup: function () {
        var testNode = Y.one('body');
    },
    teardown: function () {
        resetHTML(); // <- A YUI Benchmark API
    },
    fn: function () {
        testNode.get('text');
    }
});
