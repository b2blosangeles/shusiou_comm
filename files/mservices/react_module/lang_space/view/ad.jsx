
try {
	var Ad =  React.createClass({
		getInitialState: function() {
			var me = this;
			return {text:{}};
		},	
		componentDidMount:function() {
			var me = this;
			$('.content_bg').find('video').attr('autoplay', true).attr('loop', true);
			me.loadAd();
			me.loadData();
		},
		loadAd: function (cbk) {
			var me = this;
			let engCfg = {
				request:{code:'getAdList', 
					 url : _master_svr() + '/api/ad/get_default_ad.api', 
					 method:'post', 
					 dataType: "JSON",
					 data:{}
				},
				hold:2000,
				setting: {timeout:6000},
				callBack: function(data) {
					me.setState({adlist:data.data});
					if (typeof cbk === 'function') cbk();
					me.playVideo();
				}
			}
			Root.lib.loadEng(me, engCfg);			
		},
		loadData: function (cbk) {
			var me = this;
			let engCfg = {
				request:{code:'getShusiouText', 
					 url : _master_svr() + '/api/content_data/shusiou_data.api', 
					 method:'post', 
					 dataType: "JSON",
					 data:{lang:null, group:['home_page']}
				},
				hold:2000,
				setting: {timeout:6000},
				callBack: function(data) {
					me.setState({text:data});
					if (typeof cbk === 'function') cbk();
				}
			}
			Root.lib.loadEng(me, engCfg);			
		},			    
		dictionary:function(v) {
			if (!this.props.route || !this.props.route.env ||!this.props.route.env.dictionary) return v;
			return this.props.route.env.dictionary(v);
		},
		getCurrentLanguage: function() {
			return this.props.route.env.getCurrentLanguage();	
		},
		getText:function(v) {
			return this.state.text[this.getCurrentLanguage() + '/home_page/'+v];
		},
		textStyle:function() {
			var me = this;
			if (me.props.route.env.state.Breakpoint == 'sm' || me.props.route.env.state.Breakpoint == 'sx') {
				return {'font-size':'0.8em'}
			} else {
				return {'font-size':'1em'}	
			}
		},
		playVideo: function() {
			let me = this,
			    idx = Math.floor(Math.random()*me.state.adlist.length),
			    r = me.state.adlist[idx],
			    ss = Math.floor(r.video_length / 25);

			var l = 'https://'+ _node_svr() +  '/api/video/pipe.api?space=' + r.space + '&video_fn='+ r.vid + '&ss=' + 
			     (Math.floor(Math.random() * ss) * 25 + 10)
			    + '&t=9';			
					
			$('.content_bg').find('video').attr("src", l);
		},
		render: function() {
			var me = this;
			return (
				<div className="content_section">
					<br/>
					<div className="container">
						
						<div className="col-sm-4 col-lg-4 col-md-4"> 
							<div className="overlayer_box">
								<h4 className="header">{me.dictionary('what_to_study')}</h4> 
								<p className="overlayer_box_body" style={me.textStyle()}
									dangerouslySetInnerHTML={{__html: me.getText('what_to_study')}} />
								<p> <a href="JavaScript:vpid(0)" onClick={me.playVideo.bind(me,{id:1})}
									    className="btn btn-md btn-danger bottom-adjust" >
										{me.dictionary('more_detail')}</a>									
								</p>
							</div>	
						</div>
						
						<div className="col-sm-4 col-lg-4 col-md-4"> 
							<div className="overlayer_box">
								<h4 className="header">{me.dictionary('how_to_study')}</h4> 
								<p className="overlayer_box_body"  style={me.textStyle()}
									dangerouslySetInnerHTML={{__html: me.getText('how_to_study')}} />
								<p> <a href="JavaScript:vpid(0)" onClick={me.playVideo.bind(me,{id:2})}
									    className="btn btn-md btn-warning bottom-adjust" >
										{me.dictionary('more_detail')}</a>
								</p>
							</div>	
						</div>
						
						<div className="col-sm-4 col-lg-4 col-md-4"> 
							<div className="overlayer_box">
								<h4 className="header">{me.dictionary('how_i_studied')}</h4> 
								<p className="overlayer_box_body"  style={me.textStyle()}
									dangerouslySetInnerHTML={{__html: me.getText('how_i_studied')}} />
								<p> <a href="JavaScript:vpid(0)" onClick={me.playVideo.bind(me,{id:3})}
									    className="btn btn-md btn-success bottom-adjust" >
										{me.dictionary('more_detail')}</a>
								</p>
							</div>	
						</div>						
					</div>	
					<div className="content_bg">
						<video src="" className="align-middle" muted></video>
					</div>
				</div>
			)
		}	
	});	
} catch (err) {
	console.log(err.message);
}
