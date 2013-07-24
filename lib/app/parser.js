/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var Table = require('cli-table'),
    numeral = require('numeral'),
    WIP = 'Local';

// The will get a lot of cleanup in the near future
function prettify (results) {
    var data = {},
        refs = [], ref,
        tables = {}, table,
        output = '',
        field,
        agent, test, set, self, fastest, slowest, row, result, sha;

    results.forEach(function (result) {

        agent = result.UA.split(' ')[0];

        if (!data[result.name]) {
            data[result.name] = {};
        }

        if (!data[result.name][agent]) {
            data[result.name][agent] = {
                refs: [],
                fastest: null,
                slowest: null
            };
        }

        if (!data[result.name][agent].refs[result.ref]) {
            data[result.name][agent].refs[result.ref] = {
                unit: result.unit,
                cumulative: 0,
                average: 0,
                count: 0,
                slower: null,
                errorMargin: result.stats.rme
            };
        }

        if (refs.indexOf(result.ref) === -1) {
            refs.push(result.ref);
        }

        data[result.name][agent].refs[result.ref].cumulative += result.value;
        data[result.name][agent].refs[result.ref].count++;
        tables[result.name] = new Table({
            head: [''],
            style : {
                compact : true,
                'padding-right' : 2,
                'padding-left' : 2
            }
        });
    });
    // Generate the averages
    for (test in data) {
        set = data[test];
        for (agent in set) {
            for (ref in set[agent].refs) {
                self = set[agent].refs[ref];
                self.average = self.cumulative / self.count;
            }
        }
    }

    // Figure out the fastest/slowest
    for (test in data) {
        set = data[test];
        for (agent in set) {
            fastest = null;
            slowest = null;

            for (ref in set[agent].refs) {
                self = set[agent].refs[ref];

                if (!fastest || self.average > fastest) {
                    set[agent].fastest = ref;
                    fastest = self.average;
                }
                if (!slowest || self.average < slowest) {
                    set[agent].slowest = ref;
                    slowest = self.average;
                }
            }
        }
    }

    // Figure out the slower %
    for (test in data) {
        set = data[test];
        for (agent in set) {
            fastest = set[agent].fastest;
            slowest = set[agent].slowest;

            for (ref in set[agent].refs) {
                self = set[agent].refs[ref];
                self.slower = (((set[agent].refs[fastest].average / self.average) - 1) * 100);
            }
        }
    }

    // Display the results
    for (test in data) {
        table = tables[test];
        refs.forEach(function (ref) {
            row = [];
            field = '';

            row.push(ref);

            for (agent in data[test]) {
                if (table.options.head.indexOf(agent) == -1) {
                    table.options.head.push(agent);
                }

                field = numeral(data[test][agent].refs[ref].average).format('0.000a') + data[test][agent].refs[ref].unit + ' ±' + data[test][agent].refs[ref].errorMargin.toFixed(1) + '% ';
                if (data[test][agent].refs[ref].slower) {
                    field += '(' + data[test][agent].refs[ref].slower.toFixed(0) + '% slower)';
                }
                row.push(field);
            }

            table.push(row);
        });
    }

    for(test in tables) {
        output += '\n### ' + test + '\n' + tables[test].toString() + '\n';
    }

    table = new Table({
        head: ['Ref', 'SHA'],
        style : {
            compact : true,
            'padding-right' : 2,
            'padding-left' : 2
        }
    });

    // Reset refs to an object (previously an array)
    refs = {};
    for(result in results) {
        refs[results[result].sha] = results[result].ref;
    }

    for (sha in refs) {
        table.push([refs[sha], (sha === WIP ? '(working tree)' : sha)]).toString();
    }

    // output += '\nRef to SHA table\n';
    // output += table.toString() + '\n';

    // Add a tab to the left side of each table
    output = output.replace(/\n│/g, '\n\t│');
    output = output.replace(/\n┌/g, '\n\t┌');
    output = output.replace(/\n├/g, '\n\t├');
    output = output.replace(/\n└/g, '\n\t└');

    return output;
    // ls -1 *.json | while read file; do printf "\n----------\n# $file\n\n----------\n"; cat $file | yb-parser; done
}

module.exports = {
    prettify: prettify
};
