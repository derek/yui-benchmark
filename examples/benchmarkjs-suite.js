/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
YUI.add('benchmarkjs-suite', function (Y, NAME) {

    var suite = Y.BenchmarkSuite = new Benchmark.Suite,
        container,
        scrollview;
    
    container = document.createElement('div')
    container.id = "container";
    document.body.appendChild(container);

    suite.add('ScrollView: Create', function () {
        scrollview = new Y.ScrollView({
            render: container
        });
    }, {
        'setup': function () {
            var test = 'asd';
        },
        'teardown' : function () {
            var blah = '123';
        }
    });

    suite.add({
        name: 'ScrollView: Create & Destroy', 
        fn: function () {
            scrollview = new Y.ScrollView({
                render: container
            });
            scrollview.destroy();
        }
    });

}, '@VERSION@', {requires: ['scrollview-base']});