var Smarty = require(env.site_path + '/api/inc/jsmart/smart.min.js'); // https://github.com/miroshnikov/jsmart

var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
delete require.cache[env.config_path + '/config.json'];
var config = require(env.config_path + '/config.json');
var cfg0 = config.db;


var connection = mysql.createConnection(cfg0);
connection.connect();
let str = 'SELECT `ip` IP, "node" TP FROM `cloud_node` WHERE `score` < 900 UNION '+
    	'SELECT `ip` IP, "comm" TP FROM `cloud_comm` WHERE `score` < 900 UNION '+
	'SELECT `ip` IP,  "master" TP FROM `cloud_master`  WHERE `score` < 900 ';

connection.query(str, function (error, results, fields) {
	connection.end();
	if (error) {
		res.send({status:'error', value:error.message});
	} else {
		let servers = {}, v = {};
		for (let i in results) {
			if (!v[results[i].TP])  v[results[i].TP] = [];
			v[results[i].TP].push(results[i].IP);
		}
		for (let o in v) {
			if (!servers[o]) servers[o] = [];
			for (let j = 0; j < v[o].length; j++) {
				servers[o].push('//' + o + (j + 1) + '.service.' + config.root );
			}
		}		
		pkg.fs.readFile(env.site_path + '/tpl/index.tpl', 'utf-8', function(err, content) {
			var tpl = new Smarty(content);
			res.send(tpl.fetch({dns:JSON.stringify(servers), master:servers.master[Math.floor(Math.random() * servers.master.length)]}));
			return true;
		});
	}
}); 
