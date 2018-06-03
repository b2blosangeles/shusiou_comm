/* ---  This cron is to upload video to a aws standard object space.  */
var path = require('path');
var env = {root_path:path.join(__dirname, '../../..')};
env.site_path = env.root_path + '/sites/master';
env.config_path = '/var/qalet_config';

var config = require(env.config_path + '/config.json');


/* -------------*/
delete require.cache[env.site_path + '/api/inc/socketNodeClient/socketNodeClient.js'];
var socketNodeClient = require(env.site_path + '/api/inc/socketNodeClient/socketNodeClient.js');
var socketClient = new socketNodeClient('https://' + config.root + '/', env);

socketClient.sendToRoom(
    'CRON_REPORT',
    {x:new Date(), Y:100},
    function(data) {
	// res.send(data);
    }
);
/* ------------- */

let pkg = {
    	mysql		: require(env.site_path + '/api/inc/mysql/node_modules/mysql'),
    	crowdProcess	: require(env.root_path + '/package/crowdProcess/crowdProcess'),
	request		: require(env.root_path + '/package/request/node_modules/request'),
	exec		: require('child_process').exec,
	fs 		: require('fs')
}; 

let awsS3Video = require(env.site_path + '/api/inc/awsS3Video/awsS3Video.js');
let tm = new Date().getTime();

var IN = [];
function s() {
	let delta_time0 = new Date().getTime() - tm;
	console.log('---- load at ----> ' +  delta_time0);
	var splitVideo = new awsS3Video(config, env, pkg, tm);	
	splitVideo.load(function(data) {
		let delta_time = new Date().getTime() - tm;
		console.log(data);
		if (delta_time < 40000 && data !== 'No new id at all') {
			setTimeout(function() {
				s();
			}, 5000);
			console.log('*** --- ***');
		} else {
			console.log('*** -IN- ***>');
			console.log(IN);
			console.log('exit current session');
			process.exit(-1);
			return true;
		}
		
	});
}
s();
