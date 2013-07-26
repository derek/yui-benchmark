function Suite (name, options) {
    this.config = {
        name: null,
        tests: []
    }

    if (typeof name === 'object') {
        // 1 argument (options)
        options = name;
    }
    else {
        // 2 arguments (name [, options])
        options.name = name;
    }

    for (key in options) {
        this.config[key] = options[key];
    }
}

Suite.prototype.add = function (name, fn, options) {
    if (typeof name === 'object' && name.name && name.fn) {
        // 1 argument (test)
        this.config.tests.push(name);
    }
    else if (typeof name === 'object') {
        // 1 argument (pairs)
        for (n in name) {
            this.add(n, name[n]);
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
}

Suite.prototype.exportConfig = function () {
    return this.config;
}
