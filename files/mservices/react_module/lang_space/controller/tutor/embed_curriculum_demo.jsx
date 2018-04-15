try {
	var Embed_curriculum_demo =  React.createClass({
		getInitialState: function() {
			var me = this;
			return {};
		},	
		componentDidMount:function() {
			var me = this;
			if (me.props.params.opt == 'new') {
				me.props.parent.getVideoInfo(me.props.params.id,
					function(data) {
						me.props.parent.setState({video:data.data[0]});
					}
				);
			}
		},		
		render: function() {
			var me = this;
			if ((me.props.params.id) && (me.props.parent.state.curriculum)) {
				return (<div>Embed_curriculum_demo : 
						
						<div>
							<h4>{me.props.parent.state.video.title}</h4>	
							<p><b>Video ID</b>:{me.props.parent.state.curriculum.vid}</p>  
							<p><b>Video Length</b>:({me.props.parent.state.curriculum.video_length} Secs)</p>
							<br/>
						<_commObj code={'video'} data={{rec:me.props.parent.state.curriculum, ss:77, size:320}}/>
						<br/>
						<_commObj code={'videoImage'}  data={{rec:me.props.parent.state.curriculum, ss:577, size:180}}/>
					
					</div>)
			} else {
				return (<div>Embed_curriculum_preview 2</div>)
			}
		}
	});
	
	
} catch (err) {
	console.log(err.message);
}
