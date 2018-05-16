try {
	var MyCurriculumById =  React.createClass({
		getInitialState: function() {
			var me = this;
			me.lib = new _commLib();
			return {
				preview_time:0,
				section:{},
				video:{},
				curriculum:{id:''},
				sections:[],
				langs:[
					{code:'en-US', desc:'English'},
					{code:'cn-ZH', desc:'Chinese'}
				],
				levels:[
					{code:'1', desc:'Entrant level'},
					{code:'2', desc:'Advanced level'}
				],				
				req:0
			};
		},
		mainBox:function() {
			var me = this;
			return (
				<div className="container">
					<div className="col-sm-6 col-lg-5 col-md-6"> 							
						<div className="overlayer_box editor_box">
							{me.leftBox(me.props.params)}
						</div>	
					</div>

					<div className="col-sm-6 col-lg-7 col-md-6"> 
						<div className="overlayer_box editor_box">
							{me.rightBox(me.props.params)}			
						</div>	
					</div>	
					<ModalPlus parent={me} />
				</div>);
		},
		callEngCbk : function(data) {
			let me = this;
			
			console.log('====callEngCbk=kkk==>');
			console.log(data);
		},
		callEng:function() {
			var me = this;
			me.setState({_eng:{
				i:[
					{url : _master_svr() + '/api/ad/get_default_ad.api', method:'get', data:{}}
				],				
				p:[
					{url : _master_svr() + '/api/ad/get_default_ad.api', method:'post', data:{}}
				],
				s:[
					{url : _master_svr() + '/api/ad/get_default_ad.api', method:'post', data:{}}
				],
				hold:0,
				setting: {timeout:30000},
				callbackfn: 'callEngCbk'
				
			}});
		},		
		leftBox:function(params) {
			var me = this;
			if (params.opt == 'new') {
				return (<Embed_new_curriculum parent={me} params={params} video={me.state.video}/>);
				
			} else return(<Embed_curriculum_profile parent={me} params={params} video={me.state.video} />);
		},
		rightBox:function(params) {
			var me = this;	
			if (params.opt == 'new') return (<Embed_curriculum_preview parent={me} params={params} video={me.state.video}/>);
			else if (!me.state.section.section_id) {
				return (<Embed_curriculum_demo parent={me} params={params} video={me.state.video}/>);
			} else {
				return (<TemplateSectionForm env={me.props.route.env} parent={me} params={params} section_id={me.state.section.section_id} section={me.state.section} />);		
			}
		},
		createSection:function() {
			var me = this;
			me.setState({section:{section_id:'new', section:{}}}, function() {});
		},
		editSection:function(id) {
			var me = this;
			var o = me.state.sections, v = [];	
			for (var i = 0; i < o.length; i++) {
				if (o[i].section_id == id) {
					me.setState({section:o[i], section_id:id});
					return true;
				}
			} 
			return true;  			       
		},
		deleteSection:function(id) {
			var me = this;
			var o = me.state.sections, v = [];	
			for (var i = 0; i < o.length; i++) {
				if (o[i].id == id) continue;
				else v[v.length] = o[i]; 
			}
			me.setState({sections:v}, function() {
				me.submitCurriculum(me.props.params);
				me.setState({section:{track:{}}});
			});
			return true;       
		},
		componentDidMount:function() {
			var me = this;
			var vid = '';	
			if (me.props.params['opt'] == 'new') {
				vid = me.props.params['id'];
				me.getVideoInfo(vid,
					function(data) {
						me.setState({vid:vid, video:data.data[0]});
						me.leftBox(me.props.params);
						me.rightBox(me.props.params);				
					}
				);
			} else if (me.props.params['opt'] == 'edit') {
				var cid = me.props.params['id'];
				me.getCurriculumById(cid, function(data) {		
					if (data.data.curriculum_id) {
						me.setState({curriculum:data.data, 
						sections: data.data.sections});
					} 
					me.leftBox(me.props.params);
					me.rightBox(me.props.params);
				});
			}
		},
		componentDidUpdate:function() {
			var me = this;
		},
		closePopup:function() {
			var me = this;
			me.setState({ModalPopup:'cancel'});
			return true;
		},			
		deleteCurriculum: function(params, track) {
			var me = this;			
			let cfg = {
				section: {
					body : function() {
						var ta = me;
						return (
							<div style={{padding:'1em'}}>
								<p>It is going to clean up the curriculum please confirm:</p>
								<button className="btn btn-danger btn_margin6 pull-right" onClick={ta.sendDeleteCurriculum.bind(ta)}>Confirm</button>
								<button className="btn btn-warning btn_margin6 pull-right" onClick={ta.closePopup.bind(ta)}>Cancel</button>
							</div>
						);
					}	
				},
				box_class : 'modal-content',
				popup_type : 'window',
				close_icon :false
			};
			me.lib.buildPopup(me, cfg);			
			
			
		},		
		sendDeleteCurriculum:function() {
			var me = this, curriculum_id = me.state.curriculum.curriculum_id;
			if (curriculum_id) {
				me.props.route.env.engine({
					url: _master_svr() + '/api/curriculum/myCurriculum.api',
					method: "POST",
					data: {cmd:'delete', curriculum_id:curriculum_id},
					dataType: "JSON"
				}, function( data) {
					me.closePopup();
					me.props.router.push('/tutor/my_curriculums');
				},function( jqXHR, textStatus ) {
					me.closePopup();
				});				
			} else {}
			
		},
		submitCurriculum:function(v, jump){
			var me = this, data = {};
			if (me.state.curriculum.id) {
				data = {cmd:'update', curriculum_id:me.state.curriculum.curriculum_id, vid: me.state.curriculum.vid, 
					name:me.state.curriculum.name, 
					section:me.state.section,
					published:(me.state.curriculum.published)?me.state.curriculum.published:0,
				        sections:me.state.sections,
				        auth:me.props.route.env.state.auth
				};
			} else {
				data = {cmd:'add', vid: me.state.video.vid, name:me.state.curriculum.name, 
					mother_lang:me.state.curriculum.mother_lang, 
					learning_lang:me.state.curriculum.learning_lang, 
					level:me.state.curriculum.level, 					
				        sections:me.state.sections,
					auth:me.props.route.env.state.auth
				       };
			}
			
			me.props.route.env.engine({
				url: _master_svr() + '/api/curriculum/myCurriculum.api',
				method: "POST",
				data: data,
				dataType: "JSON"
			}, function( data) {
				if ((data.data) && v === '') {
					me.props.router.push('/tutor/my_curriculum/edit/'+data.data);
				} else if (jump) {
					me.props.router.push('/tutor/my_curriculums');
				} 
				var cid = me.props.params['id'];
				me.getCurriculumById(cid, function(data) {
					if (data.data.curriculum_id) {
						me.setState({curriculum:data.data,
						sections: data.data.sections});
					} 
				});
			},function( jqXHR, textStatus ) {
				console.log('error');
			});			
		},
		dictionary:function(v) {
			if (!this.props.route || !this.props.route.env ||!this.props.route.env.dictionary) return v;
			return this.props.route.env.dictionary(v);
		},
		refreshSections : function() {
			let me = this;
			me.getCurriculumById(me.state.curriculum.curriculum_id, function(data) {
				if (data.data.curriculum_id) {
					me.setState({curriculum:data.data,
					sections: data.data.sections});
				}
			});			
		},
		getCurriculumById: function(curriculum_id, cbk) {
			var me = this;
			me.props.route.env.engine({
				url: _master_svr() + '/api/curriculum/myCurriculum.api',
				method: "POST",
				data: { cmd:'getCurriculumById',
				       curriculum_id:curriculum_id,
				      auth:me.props.route.env.state.auth},
				dataType: "JSON"
			}, function( data) {
				if (typeof cbk == 'function') {
					cbk(data);
				}
			},function( jqXHR, textStatus ) {
				console.log( "Request failed: " + textStatus );
			});
		},	
		handleTextChange:function(event){
			this.setState({c_text: event.target.value});
		},
		saveAble: function() {
			var me = this, A = me.state.list;
			if (!me.state.c_text) return {display:'none'};
			else return {display:''};
		},
		abortSection: function() {
			var me = this;
			me.setState({section:{track:{}}});
			me.componentDidMount();
		},		
		acceptSection: function(v) {
			var me = this, section = me.state.section;	
			section.o = v;
			me.setState({section:section}, function() {
				me.submitCurriculum(me.props.params);	
				me.setState({section:{track:{}}});			
			});
		},		
		render: function() {
			var me = this;
			return (
				<div className="content_section">
					<br/>
					{me.mainBox()}
					<div className="content_bg opacity_bg">
						<video id="video_ad" className="video_ad"  src="" muted></video>
					</div>
					<_commWin parent={me} />
					<_commEng parent={me} />
				</div>
			)
		}
	});	
	
} catch (err) {
	console.log(err.message);
}
