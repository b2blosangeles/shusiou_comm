/* ---  This cron is to upload video to a aws standard object space.  */

var path = require('path');
var env = {root_path:path.join(__dirname, '../../..')};
env.site_path = env.root_path + '/sites/master';
env.config_path = '/var/qalet_config';

var config = require(env.config_path + '/config.json');

let pkg = {
    	mysql		: require(env.site_path + '/api/inc/mysql/node_modules/mysql'),
    	crowdProcess	: require(env.root_path + '/package/crowdProcess/crowdProcess'),
	request		: require(env.root_path + '/package/request/node_modules/request'),
	exec		: require('child_process').exec,
	fs 		: require('fs')
}; 
const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk');

var s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('nyc3.digitaloceanspaces.com'),
    accessKeyId: config.objectSpaceDigitalOcean.accessKeyId,
    secretAccessKey: config.objectSpaceDigitalOcean.secretAccessKey
});
var bucket_name = 'shusiou-dev-2';
function s(Marker) {
	var params1 = { 
		Bucket: bucket_name,
		MaxKeys : 1000,
		Marker : Marker,
		Delimiter: '',
		Prefix: '/'
	};
	me.s3.listObjects(params1, function (err, data) {
		if(err) {
			console.log({err:'err.message'});
			return true;
		} else {
			console.log(data);
		}
	});
}
s();
