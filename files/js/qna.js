(function () { 
	var obj =  function () {
		this.sessionService = function(incomeData) {
			let me = this;
			me.socket.emit('clientData', {_socket: incomeData.data._sender, _link: incomeData._link, 
				_proxy: me.cfg.proxy, 
				data: {
				      ping_id : incomeData.data.ping_id, _code : '_ReSessionRequest',
				      }});			
		}		
		this.incomeServer = function(incomeData) {
			let me = this;
			if (typeof me.cfg.onServerData === 'function') {
				me.cfg.onServerData(incomeData, me.socket);
			}
			return true;			
		}
		this.sendToServer = function(data) {
			let me = this;
			data._sender = me.socket.id;
			data._code = '_sendToServer';
			me.socket.emit('clientData', {_socket: me.cfg.master_socket_id, _link: me.cfg.link, _proxy: me.cfg.proxy, 
				data: data});		
		}
		this.sendToClient = function(data, socket_id) {
			let me = this;
			data._sender = me.socket.id;
			me.socket.emit('clientData', {_socket: socket_id, _link: me.cfg.link, _proxy: me.cfg.proxy, 
				data: data});		
		}
		this.getClients = function() {
			let me = this;
			return me.ping_id;
		}
		this.incomeClient = function(incomeData) {
			let me = this;
			if (typeof me.cfg.onClientData === 'function') {
				me.cfg.onClientData(incomeData, me.socket);
			}			
		}		
		this.init = function(cfg) {
			let me = this;
			me.ping_id = {};
			me.cfg = cfg;
			
			me.socket = io.connect(me.cfg.link);
			me.socket.on('connect', function() {
				if (typeof cfg.onConnect === 'function') {
					cfg.onConnect(me.socket);
				}
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
				if (me.cfg.master_socket_id) { 
					setInterval(function() {
						let ping_id = new Date().getTime();
						me.ping_id[ping_id] = 1;
						me.socket.emit('clientData', {_socket: me.cfg.master_socket_id, _link: me.cfg.link, _proxy: me.cfg.proxy, 
						data: {_sender: me.socket.id, _code : '_sessionRequest', ping_id: ping_id}});
						me.audit();
					}, 2000);
				}
			});			
		};
		this.audit = function() {
			let me = this;
			for (var k in me.ping_id) {
				if ((new Date().getTime() - k) > 3000) {
					me.socket.close();
					window.close();
				}
			};
		};
	};
	window.QNA = obj;
})();
