(function () { 
	var obj =  function () {
		this.sessionService = function(incomeData) {
			let me = this;
			console.log('---this.sessionService---');
			me.socket.emit('clientData', {_socket: incomeData.data._sender, _link: incomeData._link, 
				_proxy: me.cfg.proxy, 
				data: {connection: [me.socket.id, incomeData.data._sender], _code : 'resQnaRequest',
				      ping_id : incomeData.data.ping_id
				      }});			
		}		
		this.server = function(incomeData) {
			
			console.log('---this.server---');
			let me = this;
			if (typeof me.cfg.onServerData === 'function') {
				me.cfg.onServerData(incomeData, me.socket);
			}
			return true;
			me.socket.emit('clientData', {_socket: incomeData.data._sender, _link: incomeData._link, 
				_proxy: me.cfg.proxy, 
				data: {connection: [socket.id, incomeData.data._sender], _code : 'resQnaRequest',
				      ping_id : incomeData.data.ping_id
				      }});			
		}
		this.client = function(incomeData) {			
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
					console.log('---A --- this.server---');
					console.log(incomeData);
					if (incomeData.data._code === '_sessionRequest') {
						me.sessionService(incomeData);
					} else if (incomeData.data._code === 'clientRequest') {
						me.server(incomeData);
					} else{
						delete me.ping_id[incomeData.data.ping_id];
						me.client(incomeData);
					}
				});
				if (me.cfg.master_socket_id) { 
					setInterval(function() {
						let ping_id = new Date().getTime();
						me.ping_id[ping_id] = 1;
						me.socket.emit('clientData', {_socket: me.cfg.master_socket_id, _link: me.cfg.link, _proxy: me.cfg.proxy, 
						data: {_sender: me.socket.id, _code : '_sessionRequest', ping_id: ping_id}});
						document.getElementById('income_info').innerHTML =  JSON.stringify(me.ping_id);
						me.audit();
					}, 1000);
				}
			});			
		};
		this.audit = function() {
			let me = this;
			for (var k in me.ping_id) {
				if ((new Date().getTime() - k) > 2000) {
					me.socket.close();
					window.close();
				}
			};
		};
	};
	window.QNA = obj;
})();
