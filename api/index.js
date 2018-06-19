pkg.fs.readFile(env.site_path + '/tpl/index.tpl', 'utf-8', function(err, content) {
	res.send(content);
});
