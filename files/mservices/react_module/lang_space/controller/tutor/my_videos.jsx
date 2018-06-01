try {	
	var My_videos =  React.createClass({
		getInitialState: function() {
			var me = this;
			return {opt:'', list:[]};
		},	
		componentDidMount:function() {
			var me = this;
			setTimeout(me.callEng);
		},
		componentDidUpdate:function() {
			var me = this;	
		},
		io:function(list) {
			let me = this;
			let _itv = setInterval(function() {
				if (!Root.socket || !Root.socket.id) {
					return true;
				}
				if (!me.socket_id || me.socket_id  !== Root.socket.id) {
					console.log(me.socket_id + '<-->' + Root.socket.id);
					Root.socket.emit('createRoom', 'VID_NIU');
					me.socket_id = Root.socket.id;
					Root.socket.on('serverData', function(income) {
						if (income._room === 'VID_NIU') {
							console.log('Root.socket.id - ' + Root.socket.id + ' (' + income.data.Y + ')')
						}
					});				

				}						
			}, 1000);
			
			for (let i=0; i < list.length; i++) {
				if (list[i].space_status === 1) {
				//	Root.socket.emit('createRoom', 'VID_' + list[i].vid); 
				}	
			}
		},
		callEng:function() {
			var me = this;
			let engCfg = {
				Q:[
					{code:'getlist', url : _master_svr() +  '/api/video/myVideo.api?opt=getMyVideos', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth},
					 time_out :6000	
					}
				],
				hold:500,
				setting: {timeout:3000},
				callBack: function(data) {
					var EngR = data.EngResult;
					me.setState({
						list:(!EngR  || !EngR.getlist || !EngR.getlist.data) ? [] :
						EngR.getlist.data},
						function() {
							me.io(EngR.getlist.data);
							// Root.lib.alert(me, 'Data load success!', 'success', 3000);
						});	
				}
				
			}
			Root.lib.loadEng(me, engCfg);
		},		
		componentDidUpdate:function() {
			var me = this;
			Root.lib.routerPermission(Root.state.userInfo, me.props.route.permission);
		},		
		dictionary:function(v) {
			if (!this.props.route || !this.props.route.env ||!this.props.route.env.dictionary) return v;
			return this.props.route.env.dictionary(v);
		},
		getCurrentLanguage: function() {
			return this.props.route.env.getCurrentLanguage();	
		},
		getText:function(v) {
			return this.state.text[v][this.getCurrentLanguage()];
		},
		textStyle:function() {
			var me = this;
			if (me.props.route.env.state.Breakpoint == 'sm' || me.props.route.env.state.Breakpoint == 'sx') {
				return {'font-size':'0.8em'}
			} else {
				return {'font-size':'1em'}	
			}
		},
		bgFilmThumbnail:function(v) {
			return {width:'100%', height:'100%', background:'url('+v+')','background-size':'contain'}	
		},		
		bgFilmAddStyle:function(t) {
			var url =  _master_svr() +  '/images/movie_add.png';
			return {width:'100%', background:'url('+url+')',
				'background-repeat':'no-repeat',
			       'background-position':'center',
			       'background-color':'lightyellow'
			       }
		},
		closeAdmin:function(v) {
			var me = this;
			me.setState({ModalPlus:'cancel'});
		},
		videoAdmin:function(v) {
			var me = this;
			let cfg = {
				section: {
					body : function() {
						let ta = me, popid = new Date().getTime();
						return (
						<My_video_admin parent={ta} id={popid}/>
						);
					}
				},
				box_class : 'modal-content',
				popup_type : 'window',
				close_icon : true
			};
			Root.lib.popupWin(me, cfg);
			return true;
		},		
		videoInfo: function(rec) {
			var me = this;
			let cfg = {
				section: {
					body : function() {
						let ta = me, popid = new Date().getTime();
						return (
						<Popup_my_video_info parent={ta} rec={rec} id={popid}/>
						);
					}
				},
				box_class : 'modal-content',
				popup_type : 'window',
				close_icon : false
			};
			Root.lib.popupWin(me, cfg);
			return true;
		},		
					
		videoDelete:function(vid){
			var me = this;
			$.ajax({
				url:  _master_svr() +  '/api/video/myVideo.api?opt=removeUserVideo',
				method: "POST",
				data: {vid:vid, auth: me.props.route.env.state.auth},
				dataType: "JSON"
			}).done(function( data) {
				me.callEng();
			}).fail(function( jqXHR, textStatus ) {
				// me.pullList();
			});
		},		
		render: function() {
			var me = this;
			
			return (
				<div className="content_section">	
					<br/>
					<div className="container">
						<div className="col-sm-4 col-lg-4 col-md-4"> 
							<div className="overlayer_box homepage_box" style={{'margin-bottom':'1em', 'padding':'0.5em'}}>
								<a href="JavaScript:void(0)" onClick={me.videoAdmin.bind(me,'admin')}>
								<img src={ _master_svr() + '/images/film_bg.png'} style={me.bgFilmAddStyle()} />
								</a>	
							</div>			
						</div>
						{me.state.list.map(function(a){ 
							if (a.space_status === 1) return(
							<div className="col-sm-4 col-lg-4 col-md-4"> 
	
								<div className="overlayer_box homepage_box" style={{'margin-bottom':'1em', 'padding':'0.5em'}}>
									<div className="video_thumbnail_icon_group">
										<button type="button" className="btn btn-danger"
											onClick={me.videoInfo.bind(me,a)}>
											<i className="fa fa-play" aria-hidden="true"></i>
										</button>										
									</div>
									<_commObj code={'videoBgImage'}  
										data={{img: _master_svr() + '/images/film_bg.png', 
										rec:a, ss:90, size:320}}/>
								</div>

							</div>							
							)
							else return(
							<div className="col-sm-4 col-lg-4 col-md-4"> 
								<div className="overlayer_box homepage_box" style={{'margin-bottom':'1em', 'padding':'0.5em'}}>
									<img src={ _master_svr() + '/images/film_bg.png'} style={me.bgFilmThumbnail(a.org_thumbnail)} />	
									<div className="video_thumbnail_text video_thumbnail_text_bg pull-right">
										<i className="fa fa-info-circle"></i> {(a.message)?a.message:'Processing ...'}
									</div>
								</div>

							</div>							
							);							
						})}							
					</div>						

					<br/><br/><br/><br/>
					<div className="content_bg opacity_bg"/>
					{Root.lib.landingModal(me)}
				</div>
			);
		}
	});	
	
} catch (err) {
	console.log(err.message);
}
