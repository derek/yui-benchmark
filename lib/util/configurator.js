/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

/*jslint node: true */
"use strict";

var util = require('util'),
    path = require('path'),
	EventEmitter = require('./event-emitter'),
	configurables = require('./constants').configurables,
    Configurator = function Configurator () { },
	proto;

util.inherits(Configurator, EventEmitter);

proto = Configurator.prototype;
proto._configs = {};
proto._configs.refs = [];

var properties = {};
Object.keys(configurables).forEach(function (key) {
	properties[key] = {
        writable: true,
        value: configurables[key].value
	};
});

Object.defineProperties(proto, properties);

proto.get = function (key) {
    return this._configs[key];
};

proto.set = function (key, val) {
    if (configurables[key].type.resolve) {
        val = path.resolve(process.cwd(), val);
    }

    this._configs[key] = val;
};

proto.import = function (pairs) {
    var config = this._configs,
        self = this;

    Object.keys(pairs).forEach(function (key) {
        self.set(key, pairs[key]);
    });
};

proto.export = function () {
    return this._configs;
};

module.exports = Configurator;
