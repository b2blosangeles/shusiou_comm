(function () { 
	var obj =  function (config, env, pkg, tm) {
		// find next need processed vid from table video_space
		this.load = function(load_callback) {
			let me = this;
			var CP = new pkg.crowdProcess();
			var _f = {};	
			
			_f['loadspace']  = function(cbk) {
				var patt = new RegExp(config.environment);
				var connection = pkg.mysql.createConnection(config.db);
				connection.connect();
				var str = "SELECT * FROM `cloud_spaces` WHERE `status` = 0 ORDER BY `size` ASC;";
				
				connection.query(str, function (err, results, fields) {
					for (var i = 0; i < results.length; i++) {
						if (patt.test( results[i].bucket)) {
							me.space = { 
								space_id : results[i].bucket,
								space_url :'https://'+results[i].bucket+'.' + config.objectSpace.endpoint + '/',
								mnt_folder : '/var/shusiou_video/'
							};
							break;
						}
						
					}
					cbk(true);
				});
			};
			
			_f['ip']  = function(cbk) {
			    pkg.fs.readFile('/var/.qalet_whoami.data', 'utf8', function(err,data) {
				if ((err) || !data) {
					cbk({err:'Missing ip'}); CP.exit = 1;		
				} else {
					cbk(data.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' '));
				}
			    });
			};
			_f['db_video']  = function(cbk) { /* get database catched local videos */
				var connection = pkg.mysql.createConnection(config.db);
				connection.connect();
				var str = "SELECT A.*, B.`status` FROM `video` A LEFT JOIN `video_space` B ON A.`vid` = B.`vid`" +
					" WHERE A.`server_ip` = '" + CP.data.ip + "' AND B.`status` < 1 OR B.`status` IS NULL " +
					" ORDER BY `status` DESC LIMIT 3";

				connection.query(str, function (err, results, fields) {
					connection.end();
					if (err) {
						cbk({err:err.message}); CP.exit = 1;
					} else if (!results.length) {
						cbk(true); CP.exit = 1;
					} else {
						cbk(results[0]);
					}
				});
			};
			_f['get_vid']  = function(cbk) { 
				let vid = CP.data.db_video.vid, status = CP.data.db_video.status;
				if (status === null || status === '') {
					var connection = pkg.mysql.createConnection(config.db);
					connection.connect();
					var str = "INSERT INTO `video_space` (`vid`, `space`, `status`, `added`) VALUES " +
						" ('" + vid + "', '" + me.space.space_url + "', 0, NOW()) " +
					    	" ON DUPLICATE KEY UPDATE `space` = '" + me.space.space_url + "' ";
				
					connection.query(str, function (error, results, fields) {
						connection.end();
						cbk(vid);
					});
				} else {
					cbk(vid);
				}
			};
			_f['get_video_name']  = function(cbk) { 
				let vid = CP.data.get_vid,
				    video_folder = me.space.mnt_folder,
				    _file = video_folder + vid + '/video/' + vid;

				pkg.fs.stat(_file, function(err, stat) {
					if (err) {
						pkg.exec('mv -f ' + video_folder + vid + '/video/video.mp4 ' +  _file, 					 
							function(err, stdout, stderr) {
								cbk(_file);
							});
					} else {
						cbk(_file);
					}
				});
			};
			CP.serial(
				_f,
				function(result) {
								
					if (CP.data.db_video === true) {
						load_callback('No new id at all');
					} else {
						if ((CP.data.get_vid) && (CP.data.get_video_name)) {
							me.loadvid(
								me.space,
								CP.data.get_vid, CP.data.get_video_name, function(data) {
								load_callback(data);
							});
						} else {
							load_callback(result.results);
						}
					}
				},
				58000
			);		
		
		}	
		this.loadvid = function(space, vid, video_name, cbk) {
			console.log('process vid ' + vid + ' ... ');
			let me = this,
			    _p = video_name.match(/(.+)\/([^\/]+)$/);
				
			me.source_path = _p[1] + '/';
			me.source_file = _p[2];
			me.space_id = space.space_id;
			me.space_url = space.space_url;
			me.space_info = 'videos/' + me.source_file + '/_info.txt';
			me.trunkSize = 512 * 1024;
			me.vid = vid;
			pkg.request(me.space_url +  me.space_info, 
				function (err, res, body) {
					let v = (err) ? false : {};
					if (v !== false) { 
						try {  v = JSON.parse(body); } catch (e) { v = false; }
					}
					if (!v || !v.status || !v.status._s || !v.status._t) {
						let CP_A = new pkg.crowdProcess(), 
						    _fA = {};
						
						_fA['_s'] = function (cbks) { me.split('_s', video_name, cbks); }
						_fA['_t'] = function (cbks) { me.split('_t', video_name, cbks); }
						CP_A.parallel( _fA,
							function(results) {						
								cbk(results);
							},
							50000
						);											

					} else {
						me.doneDBVideoStatus(v, function(d) {
							if (d) {
								let tmp_root = '/var/shusiou_cache/tmpvideo/' + me.source_file + '/';
								pkg.exec('rm -fr ' + tmp_root + ' && rm -fr ' + video_name, 
									function(err, stdout, stderr) {
										cbk('This video already been processed.' + me.vid);
								//	me.load();
								});								 
							}
						});

					}
				});
			

		}
		this.doneDBVideoStatus = function(v, cbk) {
			let me = this;
			if ((v) && (v.status) && (v.status._t) && (v.status._s)) {
				var connection = pkg.mysql.createConnection(config.db);
				connection.connect();
				var str = "INSERT INTO `video_space` (`vid`, `space`, `status`, `added`) VALUES " +
					" ('" + me.vid + "', '" + me.space.space_url + "', 1, NOW()) ON DUPLICATE KEY UPDATE `status` = 1 ";

				connection.query(str, function (error, results, fields) {
					connection.end();
					cbk('This video has been processed.' + me.vid) 
				});
			} else {
				cbk(false);
			}
		}		
		this.split = function(_type, _file, _cbk) {
			
						
			
			let me = this;
			let tmp_folder = '/var/shusiou_cache/tmpvideo/' + me.source_file + '/' + _type + '/';
			let space_dir = 'videos/' + me.source_file + '/' + _type + '/';
			
			
			var CP = new pkg.crowdProcess();
			var _f = {}; 
			// look for trackes exist temp directory
			_f['tracks'] = function(cbk) {
				me.getInfo(me.space_url +  me.space_info, me.source_path + me.source_file,
					function(v) {
						if (v === false) {
							CP.exit = 1;
							cbk({err:'no videoinfo'});
						} else {
							var folderP = require(env.site_path + '/api/inc/folderP/folderP');
							var fp = new folderP();		
							fp.build(tmp_folder, () => {
								pkg.fs.readdir( tmp_folder, (err, files) => {
									if (_type === '_t') {
										var condition = (files.length != Math.ceil(v.filesize / me.trunkSize));
									} else if (_type === '_s')
										var condition = (files.length != Math.ceil(v.length / 5));
									else var condition = false;

									if (err || condition) {
										me.splitVideo(_type, tmp_folder, function(data) {
											if (data.err) {
												CP.exit = 1;
												cbk(data);
											} else {
												cbk(data.list); 
											}
											
										});
									} else {
										cbk(files);					
									}

								});			

							});						
						}
					}
				);
			};
			// clean_dirty_files_on_space
			_f['space_tracks'] = function(cbk) { 
				var params = { 
				  Bucket: me.space_id,
				  Delimiter: '',
				  MaxKeys : 1000,
				  Marker : '',
				  Prefix: space_dir
				}, v = {};
						
				function listAllObject(params, callback) {
					me.s3.listObjects(params, function (err, data) {
						if(err) callback(err.message);
						for (var o in data.Contents) {
							let key = data.Contents[o].Key.replace(space_dir, '');
							v[key] = data.Contents[o].Size;
						}

						if (data.IsTruncated) {
							params.Marker = data.NextMarker;
							listAllObject(params, callback)
						} else {
							
							console.log('=====>');
							console.log(Object.keys(v).length);
							console.log('<=====>');	
							callback(v);
						}

					})

				}
				listAllObject(params, function(v) {						
					if (typeof v === 'string') {
						cbk(v);
					} else {
						let tracks = CP.data.tracks;
						let diff = Object.keys(v).filter(x => !tracks.includes(x));
						if (diff.length) {
							console.log('me.removeObjects============>');
							me.removeObjects(space_dir, diff, 
								function(data) {
									CP.exit = 1;
									cbk(v);
								}		
							);
						} else {
							cbk(Object.keys(v));
						}
					}
				});
			}

			_f['upload'] = function(cbk) { 
				let tracks = CP.data.tracks,
				    space_tracks = CP.data.space_tracks;
				
				
				if (tracks.length == space_tracks.length) {
					me.getInfo(me.space_url +  me.space_info, me.source_path + me.source_file,
						function(v) {
							if (v === false) {
								cbk(me.space_url +  me.space_info + ' on ' + _type + ' Error!');
								CP.exit = 1;
							} else {	
								v['status'][_type] = 1;	
								v[_type] = tracks;	
								me.writeInfo(v, function() {
									cbk('This video ' + me.vid + ' ' + _type + ' has been processed.');
								});
							}

						}
					);					
					
				} else {
					let diff = tracks.filter(x => !space_tracks.includes(x));
					let CP1 = new pkg.crowdProcess(), _f1 = {};

					function F2D(arr, size) {
						var res = []; 
						for(var i=0;i < arr.length;i = i+size) res.push(arr.slice(i,i+size));
						return res;
					}
					var t_arr =  F2D(diff, 12)
					for (var t in t_arr) {
						_f1['P_' + t] = (function(t) { 
							return function(cbk1) {
								if (new Date().getTime() - tm > 50000) {
									CP1.exit = 1;
									cbk1(' -- skip to next time session ---'); 
									return true;
								}
							
								let ta = t_arr[t],
								    CP2 = new pkg.crowdProcess(), 
								    _f2 = {};
								
								for (var i = 0; i < ta.length; i++) {
									_f2['PA_' + i] = (function (i) {
										return function(cbk2) {
											pkg.fs.stat( tmp_folder + ta[i], function (err, stat) {
												pkg.fs.readFile( tmp_folder + ta[i], function (err, data0) {
													if (err) { cbk2({err:err.message}); }
													else {		
														var params = {
															Body: new Buffer(data0, 'binary'),
															Bucket: me.space_id,
															Key: space_dir + ta[i],
															ContentType: 'video/mp4',
															ACL: 'public-read'
														};
														me.s3.putObject(params, function(err, data) {
															if (err) {
																cbk2({err:err.message});
															} else {
																cbk2(ta[i]);
															}	 
														});
													}
												});
											});
										}								
									})(i);
								}		
								CP2.parallel(
									_f2,
									function(results2) {
										cbk1(results2.results);
									},
									10000
								);
								
							}
						})(t);			
					}
					
					CP1.serial(
						_f1,
						function(results1) {
							cbk(results1.results);
						},
						50000
					);
					
				}
			}
		
			CP.serial(
				_f,
				function(results2) {
					_cbk(JSON.stringify(results2.results));
				},
				55000
			);			
			
		};			
			
		this.init = function() {
			let me = this;
			const AWS = require(env.site_path + '/api/inc/aws-sdk/node_modules/aws-sdk')
			me.s3 = new AWS.S3({
			    httpOptions: {timeout: 50000},		
			    endpoint: new AWS.Endpoint(config.objectSpace.endpoint),
			    accessKeyId: config.objectSpace.accessKeyId,
			    secretAccessKey: config.objectSpace.secretAccessKey
			});
		}
		this.getInfo = function(space_infoname, south_name, cbk) {
			let me = this;
			pkg.request(space_infoname, 
			function (err, res, body) {
				let v = (err) ? false : {};
				if (v !== false) { 
					try {  v = JSON.parse(body); } catch (e) { v = false; }
				}
				if (v === false) { 
					let buff = new Buffer(100);
					pkg.fs.stat(south_name, function(err, stat) {
						if (err) {
							cbk(false);
							return true;
						}
						pkg.fs.open(south_name, 'r', function(err, fd) {
							pkg.fs.read(fd, buff, 0, 100, 0, function(err, bytesRead, buffer) {
								if (err) {
									CP.exit = 1;
									cbk(err.message);
									return true;
								}									
								var start = buffer.indexOf(new Buffer('mvhd')) + 17;
								var timeScale = buffer.readUInt32BE(start, 4);
								var duration = buffer.readUInt32BE(start + 4, 4);
								var movieLength = Math.floor(duration/timeScale);
								var v = {filesize:stat.size,time_scale:timeScale, trunksize: me.trunkSize,
									duration: duration, length:movieLength, status:{}};
								me.writeInfo(v, function() {
									cbk(v);
								});
							});
						});
					});		
				} else {
					cbk(v);
				}
			});			
		}
		this.writeInfo = function(v, cbk) {
			let me = this,
			    params = {
				Body: JSON.stringify(v),
				Bucket: me.space_id,
				Key: me.space_info,
				ContentType: 'text/plain',
				ACL: 'public-read'
			};	

			me.s3.putObject(params, function(err, data) {
				if (err) cbk(false);
				else cbk(true);
				// me.doneDBVideoStatus(v, cbk);
			});		
		}
		this.removeObjects = function(folder, list, callback) {
			let me = this;
			var params = {
				Bucket: me.space_id,
				Delete: {Objects:[]}
			};		
			for (var i = 0; i < Math.min(list.length,100); i++) {
				params.Delete.Objects.push({Key: folder + list[i]});
			};
			me.s3.deleteObjects(params, function(err, d) {
				if (err) return callback(err);
				else callback(d);
			});
		}
		this.splitVideo = function(_type, tmp_folder, cbk) {
			let me = this;
			switch(_type) {
				case '_t':
					pkg.exec('rm -f ' + tmp_folder + '* ' + ' && rm -f ' + tmp_folder + '*.* ' +
						 '&& split -b ' + me.trunkSize + ' ' + me.source_path +  me.source_file +  ' ' + tmp_folder + '', 					 
						{maxBuffer: 1024 * 1024}, 
						 function(err, stdout, stderr) {
							if (err) {
								cbk({err:err.message});
							} else {
								pkg.fs.readdir( tmp_folder, (err1, files) => {
									cbk((err1) ? {err:err1.message} : {list:files});
								});			
							} 
						});
					break;
				case '_s':
					pkg.exec('rm -f ' + tmp_folder + '* ' + ' && rm -f ' + tmp_folder + '*.* ' +
						 '&& ffmpeg -i ' + me.source_path +  me.source_file + 
						 ' -c copy -map 0 -segment_time 5 -reset_timestamps 1 -f segment ' + tmp_folder + 's_%d.mp4', 
						{maxBuffer: 1024 * 1024}, 
						 function(err, stdout, stderr) {
							if (err) {
								cbk({err:err.message});
							} else {
								pkg.fs.readdir( tmp_folder, (err1, files) => {
									cbk((err1) ? {err:err1.message} : {list:files});
								});			
							}
						});
					break;	
				default:
					cbk({err:'Missing _type'});
			}		
		}		
		
		this.init();
	};
	module.exports = obj;
})();
