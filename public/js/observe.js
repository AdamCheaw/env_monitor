var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
  console.log('user: '+name);
  console.log('socket id:'+socket.id );
  socket.emit('auth',{name});

});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
  alert("Disconnected from server");
});
