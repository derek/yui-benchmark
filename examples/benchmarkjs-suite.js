YUI.add('benchmarkjs-suite', function (Y, NAME) {

    var suite = Y.Benchmark.suite,
        sha = Y.Benchmark.sha,
        container,
        scrollview;
    
    container = document.createElement('div')
    container.id = "container";
    document.body.appendChild(container);

    suite.add({
        Y: Y,
        name: 'ScrollView: Create', 
        fn: function () {
            scrollview = new Y.ScrollView({
                render: container
            });
        }
    });
    
    suite.add({
        Y: Y,
        name: 'ScrollView: Create & Destroy', 
        fn: function () {
            scrollview = new Y.ScrollView({
                render: container
            });
            scrollview.destroy();
        }
    });

}, '@VERSION@', {requires: ['scrollview-base']});