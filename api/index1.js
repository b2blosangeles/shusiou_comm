let room = req.query['room'],
    socket = req.query['socket'];
pkg.fs.readFile(env.site_path + '/tpl/index1.html', 'utf-8', function(err, content) {
	res.send(content.replace(/\{\$room\}/ig, room).replace(/\{\$socket\}/ig, socket));
});
