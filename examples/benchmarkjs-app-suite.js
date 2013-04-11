/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
YUI.add('benchmarkjs-app-suite', function (Y, NAME) {

    var suite = Y.BenchmarkSuite = new Benchmark.Suite;
    
	// -- Y.Model ------------------------------------------------------------------
	suite.add('Y.Model: Instantiate a bare model', function () {
	    var model = new Y.Model();
	});

	// suite.add('Y.Model: Subclass and instantiate a bare model', function () {
	//     var MyModel = Y.Base.create('myModel', Y.Model, []),
	//         model   = new MyModel();
	// });

	// -- Y.View -------------------------------------------------------------------
	suite.add('Y.View: Instantiate a bare view', function () {
	    var view = new Y.View();
	});

	suite.add('Y.View: Instantiate and subclass a bare view', function () {
	    var MyView = Y.Base.create('myView', Y.View, []),
	        view   = new MyView();
	});
	
}, '@VERSION@', {requires: ['app']});
