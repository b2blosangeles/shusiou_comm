(function () { 
	var obj =  function () {		

		this.sendToRoom = function(room, data) {
			let me = this;
			
			me.socket.join(room, function() {
				io.to(data._room).emit('clientData', data);
				io.in(room).clients((err, clients) => {
					me.io.to(room).emit('serverMessage', 
					 { message: socket.id + ' ---> has joined room ' + room + 
					  '. Total ' + clients.length + ' clients :' + clients.join(',') });
				});
			});
			
		}		
		this.init = function(cfg) {
			let me = this;
			me.cfg = cfg;
			me.timeOut = ((me.cfg.timeOut) && (me.cfg.timeOut > 1999)) ? me.cfg.timeOut : 2000;
			
			me.socket = io.connect(me.cfg.link);
			me.socket.on('connect', function() {
				if (typeof cfg.onConnect === 'function') {
					cfg.onConnect(me.socket);
				}
			
				me.socket.on('clientData', function(incomeData) {
					console.log('---incomeData--->');
					console.log(incomeData);
				});
	
				me.socket.on('serverMessage', function(incomeData) {
					console.log('---serverMessage--->');
					console.log(incomeData);
				});				
				
			});			
		};
		this.closeSocket = function() {
			let me = this;
			me.socket.close();
		};		
	};
	window._PINGBO_ = obj;
})();
