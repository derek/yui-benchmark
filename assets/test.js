YUI.add('app-benchmark-test', function (Y) {

	var suite = Y.Benchmark.suite;
	var sha = Y.Benchmark.sha;

	console.log(sha + ': in');
	
	// -- Y.Model ------------------------------------------------------------------
	suite.add('Y.Model: Instantiate a bare model (' + sha + ')', function () {
		// /o/.test('Hello World!');
	    var model = new Y.Model();
	});

	// suite.add('Y.Model: Subclass and instantiate a bare model', function () {
	//     var MyModel = Y.Base.create('myModel', Y.Model, []),
	//         model = new MyModel();
	// });

	// // -- Y.View -------------------------------------------------------------------
	// suite.add('Y.View: Instantiate a bare view', function () {
	//     var view = new Y.View();
	// });

	// suite.add('Y.View: Instantiate and subclass a bare view', function () {
	//     Y.log(sha)
	// });

}, '@VERSION@', {requires: ['app']});