/* ---  This cron is to upload video to a aws standard object space.  */

var path = require('path');
var env = {root_path:path.join(__dirname, '../../..')};
env.site_path = env.root_path + '/sites/master';
env.config_path = '/var/qalet_config';

var config = require(env.config_path + '/config.json');
/* -------------*/
delete require.cache[env.site_path + '/api/inc/socketNodeClient/socketNodeClient.js'];
var socketNodeClient = require(env.site_path + '/api/inc/socketNodeClient/socketNodeClient.js');
var socketClient = new socketNodeClient('https://' + config.root + '/');

socketClient.sendToRoom(
    'VID_NIU',
    {x:new Date(), Y:91},
    function(data) {
	// res.send(data);
    }
);
/* -------------*/
let pkg = {
    	mysql		: require(env.site_path + '/api/inc/mysql/node_modules/mysql'),
    	crowdProcess	: require(env.root_path + '/package/crowdProcess/crowdProcess'),
	request		: require(env.root_path + '/package/request/node_modules/request'),
	exec		: require('child_process').exec,
	fs 		: require('fs')
}; 
/*
let awsS3VideoAdmin = require(env.site_path + '/api/inc/awsS3Video/awsS3VideoAdmin.js');
let tm = new Date().getTime();

function s() {
	let delta_time0 = new Date().getTime() - tm;
	console.log('---- task start ----> ' +  delta_time0);	
	var videoAdmin = new awsS3VideoAdmin(config, env, pkg, tm);	
	 videoAdmin.delete(function(data) {
		let delta_time = new Date().getTime() - tm;
		console.log(data);
		if (delta_time < 30000 && data !== 'finished') {
			let delta_time0 = new Date().getTime() - tm;
			console.log('---- task end ----> ' +  delta_time0);			
			s();
		}		
		
	});
}
s();
*/
/* --- code for cron watch ---*/
delete require.cache[__dirname + '/watch_cron.inc.js'];
let watch_cron_inc = require(__dirname + '/watch_cron.inc.js'),
    watchCron = new watch_cron_inc(__filename);
watchCron.load('master', 60);
