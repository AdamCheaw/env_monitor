var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
  console.log('user: '+name);
  console.log('socket id:'+socket.id );
  socket.emit('auth',{name});

});
socket.on('notification', function(SensorData) {
  var div = "<div>Date: "+SensorData.date+"</div>";
  div += "<div>Name: "+SensorData.name+"</div>";
  div += "<div>temp: "+SensorData.temp+"</div>";
  div += "<div>onConnect: "+SensorData.onConnect+"</div>";
  div += "------------------------------------------";
  var selector = "#"+SensorData._id;
  $("#"+SensorData._id).html(div);
  console.log(SensorData);
});
socket.on('disconnect', function () {
  console.log('Disconnected from server');
  alert("Disconnected from server");
});
