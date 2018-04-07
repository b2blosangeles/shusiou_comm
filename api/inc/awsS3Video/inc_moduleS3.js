(function () { 
	var obj =  function (config, env, pkg) {
		this.init = function() {
			let me = this;
			const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
			me.s3 = new AWS.S3({
			    endpoint: new AWS.Endpoint('nyc3.digitaloceanspaces.com'),
			    accessKeyId: config.objectSpaceDigitalOcean.accessKeyId,
			    secretAccessKey: config.objectSpaceDigitalOcean.secretAccessKey
			});
			
		}
		this.getBuckets = function(getBuckets_cbk) {	
			var me = this, params = {}, Buckets = {};
			me.s3.listBuckets(params, function(err, data) {
				if(err) {
					getBuckets_cbk({err:err.message});
					return true;
				} else {
					getBuckets_cbk(data);
				}
			});	
		}		
		this.getBucketsVid = function(getBuckets_cbk) {	
			var me = this, params = {}, Buckets = {};
			me.s3.listBuckets(params, function(err, data) {
				if(err) {
					getBuckets_cbk({err:err.message});
					return true;
				} else {
					let CP = new pkg.crowdProcess(),
					    _f = {};
					for (var i = 0; i < data.Buckets.length; i++) {
						_f[data.Buckets[i].Name] = (function(i) {
							return function(cbk){
								me.getBucketsVids(data.Buckets[i].Name,
									function(data) {
										cbk(data)
									}
								);
							}
						})(i)
					}
					CP.serial(
						_f,
						function(cpresult) {	
							getBuckets_cbk(cpresult.results);
						},
						30000
					);
				}
			});	
		}
		this.deleteBucket = function(bucket, deleteBucket_cbk) {	
			var me = this, params = {Bucket: bucket};
			me.s3.deleteBucket(params, function(err, data) {
				if(err) {
					deleteBucket_cbk({err:err});
				} else {
					deleteBucket_cbk(data);
				}
			});	
		}	
		this.cleanBucket = function(bucket, cleanBucket_cbk) {	
			var me = this, params = {Bucket: bucket};
			me.s3.listObjects(params, function(err, data) {
				if(err) {
					 cleanBucket_cbk({err:err});
				} else {
					var items = data.Contents;
					me.removeObjects(bucket, items, cleanBucket_cbk);
				}
			});	
		}		
		this.removeObjects = function(bucket, list, callback) {
			let me = this;
			var params = {
				Bucket: bucket,
				Delete: {Objects:[]}
			};
			for (var i = 0; i <Math.min(list.length, 1000); i++) {
				params.Delete.Objects.push({Key: list[i].Key});
			};
			me.s3.deleteObjects(params, function(err, d) {
				if (err) return callback(err);
				else callback(d);
			});
		}		
	
		this.getBucketVids = function(bucket_name, cbk0) {	
			var  me = this;
			var CP = new pkg.crowdProcess();
			var _f = {};

			let v = [];
			let recursive_f = function(Marker, recursive_cbk) {
				var params1 = { 
					Bucket: bucket_name,
					MaxKeys : 1000,
					Marker : Marker,
					Delimiter: '/',
					Prefix: "videos/"
				};
				me.s3.listObjects(params1, function (err, data) {
					if(err) {
						cbk({err:err.message});
						return true;
					} else {

						for (var i = 0; i < data.CommonPrefixes.length; i++) {
							v.push(data.CommonPrefixes[i].Prefix);
						}

						if (data.IsTruncated) {
							recursive_f(data.NextMarker, recursive_cbk)

						} else {
							recursive_cbk(v);
						}
					}
				});						
			}
			recursive_f('', cbk0);
		};
		
	};
	module.exports = obj;
})();
