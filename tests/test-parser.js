var vows = require('vows'),
	fs = require('fs'),
	path = require('path'),
    assert = require('assert'),
    parser = require('../lib/parser'),
    results = require(path.join(__dirname, 'assets/raw-dump')),
    prettyContents = fs.readFileSync(path.join(__dirname, 'assets/pretty.txt'), 'utf8'),
    raw = JSON.stringify(results);

vows.describe('pretty').addBatch({
    'raw': {
        topic: parser.getRaw(results),
        'should process correctly': function (parsed) {
            assert.deepEqual(JSON.parse(parsed), results);
        }
    },
    'pretty': {
        topic: parser.getPretty(results),
        'should process correctly': function (parsed) {
			/** Strip the ANSI color codes */
			parsed = parsed.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');
            assert.equal(parsed, prettyContents);
        }
    }
}).export(module);