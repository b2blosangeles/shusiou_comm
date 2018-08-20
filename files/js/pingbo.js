(function () { 
	var obj =  function () {		

		this.sendTiRoom = function(room, data) {
			let me = this;
			socket.join(room, function() {
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
				/*
				me.socket.on('serverData', function(incomeData) {
					if (incomeData.data._code === '_sessionRequest') {
						me.sessionService(incomeData);
					} else if (incomeData.data._code === '_ReSessionRequest' && (incomeData.data.ping_id)) {
						delete me.ping_id[incomeData.data.ping_id];						
					} else if (incomeData.data._code === '_sendToServer') {
						me.incomeServer(incomeData);
					} else {
						me.incomeClient(incomeData);
					} 
				});
				*/
			});			
		};
		this.closeSocket = function() {
			let me = this;
			me.socket.close();
		};		
	};
	window._QNA_ = obj;
})();
