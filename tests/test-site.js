var vows = require('vows'),
    assert = require('assert'),
    site = require('../lib/site');


function getMock (route, test, request) {
	return route(request, {
		writeHead: function () { },
		end: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length > 0) {
				args.unshift(false);
			}
			return test.callback.apply(this, args);
		}
	});
}

vows.describe('site').addBatch({
    'index': {
        topic: function () {
			var req = {};
			return getMock(site.index, this, req);
        },
        'should process correctly': function (response) {
			assert.isUndefined(response);
        }
    },
    'asset': {
        topic: function () {
			var req = {
				url: 'tests/assets/ok.txt'
			};

			return getMock(site.asset, this, req);
        },
        'should process correctly': function (response) {
			assert.equal('ok', response);
        }
    }
}).export(module);