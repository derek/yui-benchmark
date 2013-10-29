#!/usr/bin/env node

/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

'use strict';

var fs = require('fs'),
    parser = require('../lib/app/parser'),
    input = fs.readFileSync('/dev/stdin', 'utf-8'),
    results = JSON.parse(input),
    pretty = parser.prettify(results);

process.stdout.write(pretty);
