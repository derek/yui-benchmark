var suite = new PerfSuite('Y.View Performance', {
    assets: ['assets/ok.txt'],
    yui: {
        use: ['app']
    }
});

suite.add({
    'Y.View: Instantiate a bare view': function () {
        var view = new Y.View();
    }
});