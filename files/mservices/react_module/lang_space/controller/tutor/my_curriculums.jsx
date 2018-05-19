try {
	var My_curriculums =  React.createClass({
		getInitialState: function() {
			var me = this;
			return {opt:'', list:[]};
		},	
		componentDidMount:function() {
			var me = this;
			// me.pullList();
			me.callEng();
		},
		callEng:function() {
			var me = this;
			me.mapping = {
				/* --- TO DO dependence mapping ---
				'Pgetlist2' : function(CP, rec, dependenceData) {
					rec.data.dependenceData_pppp = dependenceData;
				}
				*/
			};
			me.callEngCbk = function(data) {
				let me = this;
				// me.setState({list:data});
				console.log('====callEngCbk=test==>');
				console.log(data);
			};
			/* --- TO DO fill _egn ---
			let engCfg = {
				Q:[
					{code:'getlist1', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth}},
					{code:'getlist2', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth}},					
					{parallel:true, 
					 	list:[
							{code:'Pgetlist2', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
						 		data:{cmd:'getList', auth:me.props.route.env.state.auth},
						 		dependence:['getlist1']
							}
						]
					},
					{code:'getlist3', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth}},
					{code:'getlist4', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth}}
				],
				hold:0,
				setting: {timeout:30000},
				callbackfn: 'callEngCbk'
				
			}
			*/
			let engCfg = {
				Q:[
					{code:'getlist', url : _master_svr() +  '/api/curriculum/myCurriculum.api', method:'post', 
					 data:{cmd:'getList', auth:me.props.route.env.state.auth}}
				],
				hold:0,
				setting: {timeout:30000},
				callbackfn: 'callEngCbk'
				
			}			
			me.setState({_eng:engCfg});
		},
				
		pullList1:function() {
			
			var me = this;
			me.props.route.env.engine({
				url:  _master_svr() +  '/api/curriculum/myCurriculum.api',
				method: "POST",
				data: {cmd:'getList', auth:me.props.route.env.state.auth},
				dataType: "JSON"
			}, function( data) {
				me.setState({list:data.data});
			},function( jqXHR, textStatus ) {
				console.log('error');
			});		
		},			
		pullList:function() {
			var me = this;
			me.callEng();
			/*
			me.props.route.env.engine({
				url:  _master_svr() +  '/api/curriculum/myCurriculum.api',
				method: "POST",
				data: {cmd:'getList', auth:me.props.route.env.state.auth},
				dataType: "JSON"
			}, function( data) {
				me.setState({list:data.data});
			},function( jqXHR, textStatus ) {
				console.log('error');
			});
			*/
		},			
		componentDidUpdate:function() {
			var me = this;
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
		newAddThumbnail:function(t) {
			 var idx = Math.floor(Math.random() * (6 - 1) ) + 1;
			var url = _master_svr() + '/images/teacher_' + idx + '.jpg';
			return url;
		},		
		closeAdmin:function() {
			var me = this;
			me.setState({ModalPlus:'cancel'});
			return true;
		},		
		render: function() {
			var me = this;
			
			return (
				<div className="content_section">						
					<br/>
					<div className="container">
						<div className="col-sm-4 col-lg-4 col-md-4"> 
							<div className="overlayer_box homepage_box" style={{'margin-bottom':'1em', 'padding':'0.5em'}}>
								<img src={me.newAddThumbnail()} style={{width:'100%'}}/>
								<div className="video_thumbnail_text pull-right">
									<a href={'#/tutor/my_curriculum/new/'}>
									<button type="button" 
										className="btn btn-warning">
										Add Curriculum 
									</button>
									</a>	
								</div>
							</div>			
						</div>
						{me.state.list.map(function(a){ 
							return(
								<div className="col-sm-4 col-lg-4 col-md-4"> 		
									<div className="overlayer_box homepage_box" style={{'margin-bottom':'1em', 'padding':'0.5em'}}>
										<div className="video_thumbnail_text_top">
											{a.name}	
										</div>
										<_commObj code={'videoImage'}  
											data={{rec:a, width:'100%', ss:90, size:320}}/>
										<div className="video_thumbnail_text">
											<a href={'#/tutor/my_curriculum/edit/' + a.curriculum_id}>
												<button type="button" 
													className="btn btn-warning">
													<i className="fa fa-pencil" aria-hidden="true"></i> 
													&nbsp;&nbsp;Edit
												</button>
											</a>	
										</div>										
									</div>	
								</div>			
							)							
						})}							
					</div>						

					<br/><br/><br/><br/>
					<ModalPlus parent={me} />
					<div className="content_bg opacity_bg">

					</div>	
					<_commWin parent={me} />
					<_commEng parent={me} />
				</div>
			);
		}
	});	
	
} catch (err) {
	console.log(err.message);
}
