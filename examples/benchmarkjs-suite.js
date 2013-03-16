YUI().use('scrollview-base', 'benchmark', function (Y) {

    var suite = new Benchmark.Suite(),
        container,
        scrollview;

    Y.Benchmark.addTest(suite);
    
    container = document.createElement('div')
    container.id = "container";
    document.body.appendChild(container);

    suite.add('Create', function () {
        scrollview = new Y.ScrollView({
            render: container
        });
        scrollview.destroy();
    });
    
    suite.run();

});