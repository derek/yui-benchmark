exports.index = function (req, res) {

	// Redirect to yeti
	res.writeHead(302, {
		'Location': '/yeti/',
		'Content-Type': 'text/html; charset=utf-8'
	});

	res.end();
};