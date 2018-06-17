try {		
	var ArrayInput =  React.createClass({
		getInitialState: function() {
			var me = this; 
			return {
				data:[]
			};
		},
		componentDidMount:function() {
			var me = this;
		},
		componentDidUpdate:function(prePropos, prevState) {	
			var me = this;
		},		
		addItem(event) {
			var me = this;
			me.state.data.push({});
			me.setState({data:me.state.data});
		},
		deleteItem(idx, event) {
			var me = this, v = me.state.data, nv = [];
			for (let i = 0; i < v.length; i++) {
				if (i == idx) continue;
				nv.push(v[i]);
			}
			me.setState({data:nv})
		},		
		render: function() {
			var me = this;
			return (
				<span>
					<div className="content_section">
					  {
						 me.state.data.map(function(item, idx){  
						  return(
							<div className="container">
								<div className="col-sm-1 col-lg-1 col-md-1">{idx}</div>
								<div className="col-sm-11 col-lg-11 col-md-11">
								  <input className="form-control inpit-white-bg" 
									placeholder={'input text ' + 'idx'} 
									value={me.state.data['idx']}/>
								</div>
								<div className="col-sm-1 col-lg-1 col-md-1">
									<i className="fa fa-trash" style={{"font-size":"1.5em"}}
									   onClick={me.deleteItem.bind(me, idx)}></i>
								</div>
							    </div>
							)
						 })	 
					  }					
					</div>
					
				</span>
			
			);
			
			
			return (
			<div className="content_section">
			</div>		
			<table className="table">
			  <thead>
			    <tr>
			      	<th scope="col"></th>
			      	<th scope="col">Answer</th>
			      	<th scope="col"><i className="fa fa-plus-square" onClick={me.addItem.bind(me)}
						      style={{"font-size":"1.5em"}}></i>
				</th>
			    </tr>
			  </thead>
			  <tbody>
				  {
					 me.state.data.map(function(item, idx){  
					  return(<tr>
					      <th scope="row">{idx}</th>
					      <td><input className="form-control inpit-white-bg" 
						placeholder={'input text ' + 'idx'} 
						value={me.state.data['idx']}/></td>
					      <td> <i className="fa fa-trash" style={{"font-size":"1.5em"}}
							   onClick={me.deleteItem.bind(me, idx)}></i></td>
					    </tr>)
					 })	 
				  }

			  </tbody>
			</table>
			)
		}
	});	
	
} catch (err) {
	console.log(err.message);
}
