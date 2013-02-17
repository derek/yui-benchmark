var nopt = require("nopt"),
	path = require("path"),
	options = {};

options = nopt({
	"source" : path, 
	"yuipath" : path, 
	"output" : path
}, {}, process.argv, 2);

// Normalize it as an array
if (!options.ref.push) {
	options.ref = [options.ref];
}

module.exports = options;