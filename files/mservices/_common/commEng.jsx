try {
	var _EngIndex = 0;
	var _commEng = React.createClass({		
		getInitialState: function() {
			_EngIndex = (!_EngIndex || _EngIndex > 10000) ? 1 : (_EngIndex + 1);
			return {id:_EngIndex, ModalLoading:{}};
		},
		ajax: function(rec, done, error) {
			var me = this;
			let p = {
				url:rec.url,
				method: rec.method,
				data: rec.data,
				dataType: (rec.dataType) ? rec.dataType : 'JSON'
			}
			p.data.auth = (reactCookie.load('auth'))?reactCookie.load('auth'):{};
			$.ajax(p).done(function( data) {
				if (typeof done == 'function') {
					done(data);
				}
			}).fail(function( jqXHR, textStatus ) {
				if (typeof error == 'function') {
					error(jqXHR, textStatus);
				}				
			});			
		},
		cpCall: function(eng) {
			let me = this;			
			let time_out = ((eng.setting) && (eng.setting.timeout)) ? eng.setting.timeout : 6000;
			let callbackfn = ((eng.callbackfn) && (typeof me.props.parent[eng.callbackfn] == 'function')) ?
			me.props.parent[eng.callbackfn] : function() { };
			    
			let CP0 = new me.crowdProcess(), CP = new me.crowdProcess();
			let qp = {};
			for (var i = 0; i < eng.p.length; i++) {
				qp['P_'+i] = (function(i) {
					return function(cbk) {
						me.ajax(eng.p[i], cbk, cbk);
					}
				})(i);
			}
			
			let qs = {};
			for (var i = 0; i < eng.i.length; i++) {
				qs['SA_'+i] = (function(i) {
					return function(cbk) {
						me.ajax(eng.i[i], cbk, cbk);
					}
				})(i);
			}
			qs['SB_P'] = function(cbk) {
				if (!eng.p || !eng.p.length) {
					cbk(false)
				} else {
					CP0.parallel(qp, 
						function(data1) {
							cbk(data1.results);
						}, time_out);
				}
			};			
			for (var i = 0; i < eng.s.length; i++) {
				qs['SC_'+i] = (function(i) {
					return function(cbk) {
						me.ajax(eng.s[i], cbk, cbk);
					}
				})(i);
			}
			CP.serial(qs, 
				function(data) {
					let rst = [];
					clearInterval(me._itvEng);
					viewpoint.find('.ModalLoading_' + me.state.id).modal('hide');
					me.setState({ModalLoading: {}},function(){
						callbackfn(data.results);
					});	
				},
				time_out);
			return true;
		},
		crowdProcess :  function () {
			this.serial = function(q, cbk, timeout) {
				var me = this;
				var idx = '', tm = new Date().getTime();
				var vtime = (isNaN(timeout) || timeout == 0) ? 6000 : timeout
				me.data = {};	
				var _f = function(o) {
					return function(res) {
						delete q[o];
						idx = '';
						me.data[o] = res;
					}
				}
				var _itv = setInterval(
					function(){
						if (!idx) {
							if (!Object.keys(q).length) {
								clearInterval(_itv);
								cbk({_spent_time:new Date().getTime() - tm, status:'success', results:me.data});
							} else {
								idx = Object.keys(q)[0];
								if ((q[idx]) && typeof q[idx] == 'function') {
									if (!me.exit) {
										q[idx](_f(idx));
									} else {
										delete q[idx];
										idx = '';
									}
								} 
							}
						}
						if (new Date().getTime() - tm > vtime) {
							clearInterval(_itv);
							cbk({_spent_time:new Date().getTime() - tm, status:'timeout', results:me.data});
						}				
						return true;
					}
				, 1); 
			};
			this.parallel = function(q, cbk, timeout) {
				var me = this;
				var tm = new Date().getTime(), vtime = (isNaN(timeout) || timeout == 0)?6000:timeout;

				me.data = {};	
				var count_q = 0, count_r = 0;
				for (var o in q) {
					count_q++;	
					var _f = function(o) {
						return function(res) {
							count_r++;
							me.data[o] = res;
						}
					}
					if ((q[o]) && typeof q[o] == 'function') {
						q[o](_f(o));
					} 						
				}
				var _itv = setInterval(
					function(){			
						if (count_q == count_r) {
							clearInterval(_itv);
							cbk({_spent_time:new Date().getTime() - tm, status:'success', results:me.data});
						}
						if (new Date().getTime() - tm > vtime) {
							clearInterval(_itv);
							cbk({_spent_time:new Date().getTime() - tm, status:'timeout', results:me.data});
						}				
						return true;
					}
				, 1); 		
			};
		},		
		componentDidMount:function() {
			var me = this;				
		},	
		componentDidUpdate: function (prevProps, prevState) {
			var me = this;
			if ((me.props.parent) && (me.props.parent.state._eng)) {	
				if (me.props.parent.state._eng === 'cancel') {
					me.props.parent.setState({_eng:null});
					return true
				} else {
					let eng =  JSON.parse(JSON.stringify(me.props.parent.state._eng));
					if (!eng.tm) eng.tm = new Date().getTime();
					eng.hold = (!eng.hold && eng.hold !== 0) ? 1000 : eng.hold;
					me._itvEng = setInterval(
						function() {
							if (new Date().getTime() - eng.tm > eng.hold) {
								me.loading();
								clearInterval(me._itvEng);
							}
						},
						50
					);
					me.props.parent.setState({_eng:'cancel'}, function() {
						me.cpCall(eng);			
					});
				}			
			}		
		},
		loading:function() {
			var me = this;
			me.setState({ModalLoading: {box_style : {color:'#ffffff'}, hold:10, 
				message:'<img src="' + _master_svr() + '/images/loading_spin.gif" width="24">'}},
				function() {
					viewpoint.find('.ModalLoading_' + me.state.id).modal({backdrop:'static'});				    
				    }	   
			);
		},
		ModalLoadingClass: function() {
			let me = this;
			return 'modal fade ModalLoading_'+ me.state.id;
		},			
		render: function() {
			var me = this, err_msg = '';
			var message = (me.state.ModalLoading.message) ? me.state.ModalLoading.message : '', 
			    box_style = (me.state.ModalLoading.box_style) ? me.state.ModalLoading.box_style:{color:'#ffffff'};

			return (			
				<div className={me.ModalLoadingClass()} tabindex="-1" role="dialog" aria-hidden="true">
				  <div className="modal-dialog" role="document">
					<div style={box_style}>
						<span dangerouslySetInnerHTML={{__html: message}}></span>
					</div>
				  </div>
				</div>	
			);
		}		
	});	
} catch (err) {
	console.log(err.message);
}
