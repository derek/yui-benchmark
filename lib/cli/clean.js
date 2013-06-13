var osenv = require("osenv"),
    rimraf = require("rimraf"),
    tmpdir = osenv.tmpdir(),
    path = tmpdir + 'yui3-*';

console.log("Cleaning " + path);
rimraf(path, function () {
    console.log("Done");
});
