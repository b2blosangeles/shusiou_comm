(function () { 
	var obj =  function () {		
		this.q = {};
		this.sendToRoom = function(room, data) {
			let me = this;
			me.socket.emit('clientRequest', { cmd: 'createRoom', room: room, data:data});
		}
		this.sendToSocketId = function(socket_id, data) {
			let me = this;
			me.socket.emit('clientRequest', { cmd: 'sendToSocket', socket_id: socket_id, data:data});
		}

		this.init = function(cfg) {
			let me = this;
			console.log('----me.name--->');
			console.log(me.name);
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
				
				me.socket.on('afterCreateRoom', function(incomeData) {
					console.log('---afterCreateRoom--->');
					console.log(incomeData);
				});
				me.socket.on('serverMessage', function(incomeData) {
					if (incomeData._id) {
						delete me.q['id']
					}
					

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
