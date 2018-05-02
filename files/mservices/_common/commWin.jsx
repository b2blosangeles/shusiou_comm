try {
	var _commWin = React.createClass({		
		getInitialState: function() {
			var me = this;
			return {};
		},
		componentDidUpdate:function(prePropos, prevStat) {
			var me = this;
			
			if (me.props.parent.state.ModalPopup === 'cancel') {
				me.props.parent.setState({ModalPopup:null});
				//me.render();
				viewpoint.find('.ModalPopup').modal('hide');
			} else if (me.props.parent.state.ModalPopup) {
				//me.render();
				viewpoint.find('.ModalPopup').modal({backdrop:'static'});
			}			
		},
		closePopup : function() {
			var me = this;
			me.props.parent.setState({ModalPopup:'cancel'});
			alert(123);
		},		
		ModalLoadingClass: function() {
			let me = this;	
			return 'modal fade ModalPopup';
		},		
		render: function() {
			var me = this, err_msg = '';
			var box_class = 'danger', 
			    message = (me.props.parent.state.ModalPopup) ? me.props.parent.state.ModalPopup.message : 'test 122', 
			    box_style={}, close_icon = '';
			// close_icon = (me.state.ModalPlus.close_icon === false)?'none':'';
			return (			
				<div className={me.ModalLoadingClass()} tabindex="-1" role="dialog" aria-hidden="true">
					  <div className="modal-dialog modal-lg" role="document">
						<div className={'alert alert-' + box_class} style={box_style} role="alert">
							<span dangerouslySetInnerHTML={{__html: message}}></span>
							<button type="button" className="close" 
								onClick={me.closePopup.bind(me)}
								style={{display:close_icon}}>
								&times;
							</button>
						</div>
					  </div>
				</div>	
			);
		}		
		
	});	
} catch (err) {
	console.log(err.message);
}
