exports.index = function (req, res) {
	var tasks = global.tasks;
	res.writeHead(302, {
		'Location': '/test/' + tasks.shift() + '/',
		'Content-Type': 'text/html; charset=utf-8'
	});

	res.end();
};