var socket = io();
//var SensorData = require('../../model/sensor');

socket.on('connect', function () {
  console.log('Connected to server');
});
socket.on('notification', function () {
  console.log('new data!!');
});
socket.on('disconnect', function () {
  console.log('Disconnected from server');
});
