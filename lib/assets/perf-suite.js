/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
function PerfSuite (name, options) {
	var key;

    this.config = {
        name: null,
        tests: []
    };

    if (typeof name === 'object') {
        // 1 argument (options)
        options = name;
    }
    else {
        // 2 arguments (name [, options])
        options.name = name;
    }

    for (key in options) {
        if (options.hasOwnProperty(key)) {
            this.config[key] = options[key];
        }
    }
}

PerfSuite.prototype.add = function (name, fn, options) {
	var n;

    if (typeof name === 'object' && name.name && name.fn) {
        // 1 argument (test)
        this.config.tests.push(name);
    }
    else if (typeof name === 'object') {
        // 1 argument (pairs)
        for (n in name) {
            if (name.hasOwnProperty(n)) {
                this.add(n, name[n]);
            }
        }
    }
    else {
        // 3 arguments (name, fn [, options])
        if (!options) {
            options = {};
        }

        options.fn = fn;
        options.name = name;

        this.config.tests.push(options);
    }
};

PerfSuite.prototype.exportConfig = function () {
    return this.config;
};
