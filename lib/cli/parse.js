/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
'use strict';

var Table = require('cli-table'),
    fs = require('fs'),
    parser = require('../app/parser'),
    input = fs.readFileSync('/dev/stdin', 'utf-8'),
    results = JSON.parse(input),
    pretty = parser.prettify(results);

process.stdout.write(pretty);
