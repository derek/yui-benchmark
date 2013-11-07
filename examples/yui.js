var suite = new PerfSuite('Y.View Performance', {
    yui: {
        use: ['app']
    }
});

suite.add({
    'Y.View: Instantiate a bare view': function () {
        var view = new Y.View();
    }
});