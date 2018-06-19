pkg.fs.readFile(env.site_path + '/tpl/index.html', 'utf-8', function(err, content) {
	res.send(content);
});
