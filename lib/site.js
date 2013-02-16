/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
exports.index = function (req, res) {

	// Redirect to yeti
	res.writeHead(302, {
		'Location': '/yeti/',
		'Content-Type': 'text/html; charset=utf-8'
	});

	res.end();
};