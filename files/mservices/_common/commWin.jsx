try {
	var _commWin = React.createClass({		
		getInitialState: function() {
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
		},		
		ModalLoadingClass: function() {
			let me = this;	
			return 'modal fade ModalPopup';
		},		
		render: function() {
			let me = this, ModalPopup = (me.props.parent.state.ModalPopup) ? me.props.parent.state.ModalPopup : {};
			var box_class = 'danger', 
			    message = ModalPopup.message, 
			    box_style={}, close_icon = '';
			// close_icon = (me.state.ModalPlus.close_icon === false)?'none':''; me.props.parent[ModalPopup.messageFn]()
			return (			
				<div className={me.ModalLoadingClass()} tabindex="-1" role="dialog" aria-hidden="true">
					  <div className="modal-dialog modal-lg" role="document">
						<div className={'alert alert-' + box_class} style={box_style} role="alert">
							--=={ModalPopup.messageFn}==--
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
