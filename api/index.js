let room = req.query['room'], type = req.query['type'],
    socket = req.query['socket'];
if (type === 'SR') {
	pkg.fs.readFile(env.site_path + '/tpl/SR.html', 'utf-8', function(err, content) {
		res.send(content.replace(/\{\$room\}/ig, room).replace(/\{\$socket\}/ig, socket));
	});	
} else {
	pkg.fs.readFile(env.site_path + '/tpl/index.html', 'utf-8', function(err, content) {
		res.send(content.replace(/\{\$room\}/ig, room).replace(/\{\$socket\}/ig, socket));
	});
}
