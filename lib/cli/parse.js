
var Table = require('cli-table'),
    log = require('../util/log'),
    parser = require('../app/parser'),
    fs = require('fs'),
    nopt = require('nopt'),
    options = nopt({}, {}, process.argv),
    input = fs.readFileSync('/dev/stdin', 'utf-8'),
    results = JSON.parse(input),
    pretty = parser.prettify(results);

process.stdout.write(pretty);
