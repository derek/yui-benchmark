exports.index = function (req, res) {
	res.writeHead(302, {
		'Location': '/yeti/',
		'Content-Type': 'text/html; charset=utf-8'
	});

	res.end();
};