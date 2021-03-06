var socket = io();
//var SensorData = require('../../model/sensor');

socket.on('connect', function () {
  console.log('Connected to server');
  console.log(socket.id);
  var get_param_from_url = decodeURI($(location).attr('href')).split('/').reverse()[0];
  socket.emit('subscribe',{sensorID: get_param_from_url }, function() {

  });
});
socket.on('notification', function (data) {
  console.log(data);
  var div = "<div>Id: "+data._id+"</div>";
  div += "<div>Date: "+data.date+"</div>";
  div += "<div>Name: "+data.name+"</div>";
  div += "<div>temp: "+data.temp+"</div>";
  div += "------------------------------------";
  $( ".sensorData" ).append(div);
});
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});
