// var io = require(env.site_path + '/api/inc/socket.io-client/node_modules/socket.io-client');

//let ioClient = io.connect("https://dev.shusiou.win/");
//ioClient.emit('createRoom', 'VID_NIU'); 

// ioClient.emit('clientData', {room: 'VID_NIU', data: 'niu BB'});

// var socket = io("https://dev.shusiou.win/");
var socket = require(env.site_path + '/api/inc/socket.io-client/node_modules/socket.io-client')('https://dev.shusiou.win');
socket.on('connect', function(){
  res.send('env--A');
});


