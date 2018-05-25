
try {
	var Signin =  React.createClass({
		getInitialState: function() {
			var me = this;
			return {};
		},	
		dictionary:function(v) {
			if (!this.props.route || !this.props.route.env ||!this.props.route.env.dictionary) return v;
			return this.props.route.env.dictionary(v);
		},
		handleChange:function(k,e) {
			var me = this, v = {};
			v[k] = e.target.value;
			me.setState(v);
			return true;
		},
		submitDisable:function(k,e) {
			var me = this;
			if (!me.state.username || !me.state.password || me.state.username.length < 3 || me.state.password.length < 3) return true;
			else return false;
		},
		submit:function() {
			var me = this;	
			reactCookie.remove('auth', { path: '/'});
			let engCfg = {
				request:{
					code:'getAll', 
					url: _master_svr() + '/api/auth/auth.api', 
					method:'post',
					data: {cmd:'signin', username:me.state.username, password:me.state.password},
					dataType: 'JSON'
				},
				hold:0,
				setting: {timeout:3000},
				callBack: function(data) {
					if (data.data) {
						reactCookie.save('auth', data.data.auth, { path: '/'});
						window.location.href = '/#/';
						Root.lib.alert(me, 'Success login! ', 'success', 1000, 
							function() {
								Root.getAuth();
							});
					} 
				}
			}
			Root.lib.loadEng(Root, engCfg);	
		},	
		componentDidMount:function() {
			var me = this;
		},		
		componentDidUpdate:function(prePropos, preState) {
			var me = this;
		},		
		render: function() {
			var me = this;		
			return (
				<span>
				<div className="container  body_section">
					<div class="row">

						<div className="col-md-2 col-lg-3 col-sm-1 hidden-xs"></div>
						<div className="login_form_box col-md-8  col-lg-6 col-sm-10  col-xs-12" 
							style={{'background-color':'#eee'}}>
							<form className="">
								<h3 className="text-center">{me.dictionary('menu_login')}</h3>
								<div className="form-group">
									<input type="text" className="form-control input-lg" 
										value={me.state.username}
										onChange={this.handleChange.bind(this,'username')}
										placeholder={me.dictionary('login_form_username')}/>
								</div>
								<div className="form-group">
									<input type="password" className="form-control input-lg" 
										onChange={this.handleChange.bind(this,'password')}
										placeholder={me.dictionary('login_form_password')}/>
								</div>
								<div className="form-group">
									<button type="button" className="btn btn-primary btn-lg btn-block" 
										disabled={me.submitDisable()} onClick={me.submit.bind(me)}>
										{me.dictionary('login_form_signin_button')}
									</button>
									<span><a href="#/Doc/Help">{me.dictionary('login_form_help')}?</a></span>
									<span className="pull-right"><a href="#/Signup">{me.dictionary('login_form_signup')}</a></span>
								</div>
								<div className="form-group">
									<div style={{color:'red', height:'1em'}}>{me.state.loginerr}</div>
								</div>	
								{/*<div className="form-group">
									<br/>
									<div className="container-fluid additional_login_form_box">
										<div class="row">

											<div className="form-group">
												<button className="btn btn-warning btn-lg btn-block">Sign In with Facebook</button>
											</div>
											<div className="form-group">
												<button className="btn btn-warning btn-lg btn-block">Sign In with QQ</button>
											</div>							

										</div>
									</div>	
								</div>*/}
								
							</form>	
						</div>	
						<div className="col-md-2 col-lg-3 col-sm-1  hidden-xs"></div>
					</div>

				</div>	
				<div className="content_bg opacity_bg"></div>
				</span>	
			  );
		}	
	});	
} catch (err) {
	console.log(err.message);
}
