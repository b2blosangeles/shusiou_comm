(function () { 
	var obj =  function (url, env) {
		let me = this;
		me.io = require(env.root_path + '/sites/master/api/inc/socket.io-client/node_modules/socket.io-client');

		me.connect = function () {
			let me = this;
			me.socket = me.io.connect(url, {secure: true, reconnect: true, rejectUnauthorized : false});
		}
		me.sendToRoom = function (room, data, callback, innerData) {
			let me = this;
			if (!me.socket || !me.socket.connected) {
				me.connect();
			}
			me.requestID = room + '_' + new Date().getTime();

			me.socket.on('connect', function(){
				me.socket.emit('createRoom', room);
				me.socket.emit('clientData', {_room: room, _innerData: (!innerData) ? false : innerData, _requestID:me.requestID, data: data});
			});
			setTimeout(function() {   
				me.socket.close();
			},1000);			
			me.socket.on('serverData', function(data) {
				if ((data._room) && data._requestID === me.requestID) {
					// me.socket.disconnect();
					callback(data);
					me.socket.close();
					return true;
				}
			});		
		};
		me.sendToRoomArray = function (arr, data, callback) {
		
		};		
	}	
	module.exports = obj;
})();
