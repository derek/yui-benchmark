/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var Table = require('cli-table'),
    numeral = require('numeral'),
    WIP = 'WIP';

// The will get a lot of cleanup in the near future
function prettify (results) {
    var data = {},
        refs = [], ref,
        tables = {}, table,
        output = '',
        field,
        agent, test, set, self, fastest, slowest, row, result, sha;

    results.forEach(function (result) {
        var title = result.name,
            ref = result.ref,
            agent = result.UA;

        if (!data[title]) {
            data[title] = {};
        }

        if (!data[title][ref]) {
            data[title][ref] = {};
        }

        if (!data[title][ref][agent]) {
            data[title][ref][agent] = {
                value: null,
                rme: null,
                raw: [],
                diff: {}
            };
        }

        data[title][ref][agent].raw.push({
            unit: result.unit,
            value: result.value,
            rme: result.stats.rme
        });
    });

    return tableify(calculate(data));
    // ls -1 *.json | while read file; do printf "\n----------\n# $file\n\n----------\n"; cat $file | yb-parser; done
}

function calculate (data) {
    var agent,
        refs,
        ref,
        results,
        valueSum,
        rmeSum,
        test,
        i;

    // Generate the averages
    for (test in data) {
        for (ref in data[test]) {
            for (agent in data[test][ref]) {
                valueSum = 0;
                rmeSum = 0;
                results = data[test][ref][agent];
                for(i=0; i<results.raw.length; i++) {
                    valueSum += results.raw[i].value;
                    rmeSum += results.raw[i].rme;
                }
                results.value = valueSum / results.raw.length;
                results.rme = rmeSum / results.raw.length;
            }
        }
    }

    // Generate the averages
    for (test in data) {
        for (ref in data[test]) {
            for (agent in data[test][ref]) {
                results = data[test][ref][agent];
                refs = Object.keys(data[test]);
                for(i=0; i<refs.length; i++) {
                    if (refs[i] !== ref) {
                        results.diff[refs[i]] = ((results.value / data[test][refs[i]][agent].value) - 1);
                    }
                }
            }
        }
    }

    return data;
}

function tableify (tests) {
    var tables = [],
        output = '',
        agent,
        agents,
        baseRef,
        diff,
        field,
        i,
        ref,
        rme,
        row,
        result,
        table,
        title,
        value;

    for (title in tests) {
        baseRef = Object.keys(tests[title])[0];
        agents = Object.keys(tests[title][baseRef]);
        table = new Table({
            head: [''].concat(agents),
            style : {
                compact : true,
                'padding-right' : 2,
                'padding-left' : 2
            }
        });

        for (ref in tests[title]) {
            row = [ref];

            for(i=0; i<agents.length; i++) {
                agent = agents[i];
                result = tests[title][ref][agent];
                value = numeral(result.value).format('0.000a');
                rme = numeral(result.rme / 100).format('±0.0%');
                diff = numeral(result.diff[baseRef]).format('0%');

                if (diff === '0%') {
                    diff = '';
                }
                else {
                    diff = '(' + diff + ')';
                }
                row.push(value + ' ' + rme + ' ' + diff);
            }

            table.push(row);
        }

        output += '\n### ' + title;
        output += '\n' + table.toString();
        output += '\n';
    }

    output = output.replace(/\n│/g, '\n\t│');
    output = output.replace(/\n┌/g, '\n\t┌');
    output = output.replace(/\n├/g, '\n\t├');
    output = output.replace(/\n└/g, '\n\t└');

    return output;
}


module.exports = {
    prettify: prettify
};
