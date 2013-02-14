var path = require("path"),
	fs = require("fs"),
	yuiBenchPath = path.join(__dirname, '../'),
	templateHTML = fs.readFileSync(yuiBenchPath + 'assets/template.html', 'utf8'),
	viewerHTML = fs.readFileSync(yuiBenchPath + 'assets/viewer.html', 'utf8');

exports.yuiBenchPath = yuiBenchPath;
exports.templateHTML = templateHTML;
exports.viewerHTML = viewerHTML;
