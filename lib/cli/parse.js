
var Table = require('cli-table'),
    fs = require('fs'),
    log = require('../util/log'),
    parser = require('../app/parser'),
    input = fs.readFileSync('/dev/stdin', 'utf-8'),
    results = JSON.parse(input),
    pretty = parser.prettify(results);

process.stdout.write(pretty);
