(function () { 
	var obj =  function (_code) {		
		this.q = {}, this._cnt = 0, this._id = ((_code) ? (_code + '_') : 'id_');
		
		this.sendToRoom = function(room, data, cbk) {
			let me = this;
			me.emitData({cmd: 'createRoom', room: room, data:data}, cbk);
		}
		this.leaveRoom = function(room, data, cbk) {
			let me = this;
			me.emitData({cmd: 'leaveRoom', room: room}, cbk);
		}		
		this.sendToSocketId = function(socket_id, data, cbk) {
			let me = this;
			me.emitData({cmd: 'sendToSocket', socket_id: socket_id, data:data}, cbk);
		}
		this.emitData = function(data, cbk) {
			let me = this;
			me._cnt ++;
			data._id = me._id + me._cnt;
			me.q[data._id] = {obj: data, tm : new Date().getTime(), cbk : cbk};
			me.socket.emit('clientRequest', me.q[data._id].obj);
		}
		this.closeSocket = function() {
			let me = this;
			me.socket.close();
		};
		this.audit = function(ta) {
			for (var o in ta.q) {
				if (new Date().getTime() -  ta.q[o].tm > ta.timeOut) {
					console.log('Timeout ' + o + ':'); console.log(ta.q[o].obj);
					delete(ta.q[o]);
				} 
			}
		}
		this.init = function(cfg) {
			let me = this;
			me.cfg = cfg;
			me.timeOut = (me.cfg.timeOut) ? me.cfg.timeOut : 3000;
			
			me.socket = io.connect(me.cfg.link);
			me.socket.on('connect', function() {
				if (typeof cfg.onConnect === 'function') {
					cfg.onConnect(me.socket);
				}
			
				me.socket.on('serverData', function(incomeData) {
					cfg.onServerData(incomeData);
				});
				me.socket.on('clientRequestCBK', function(incomeData) {
					console.log('clientRequestCBK===>');
					console.log(incomeData._id);
					console.log('clientRequestCBK=== Done ====');
					if ((me.q[incomeData._id]) && typeof me.q[incomeData._id].cbk === 'function') {
						me.q[incomeData._id].cbk(incomeData);
					}
					delete me.q[incomeData._id];
				});
				me._ITV = setInterval(function() { me.audit(me); }, 300);
			});
			
		};		
	};
	window._PINGBALL_ = obj;
})();
