var suite = new PerfSuite('Node tests', {
    tests: [{
        name: 'path.resolve',
        fn: function () {
        	var path = require('path');
        	path.resolve('foo', 'bar');
        }
    },{
        name: 'path.join',
        fn: function () {
        	var path = require('path');
        	path.join('foo', 'bar');
        }
    }]
});
