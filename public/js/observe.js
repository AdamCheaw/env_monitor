var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
  console.log('user: '+name);
  console.log('socket id:'+socket.id );
  socket.emit('auth',{name});

});
socket.on('notification', function(SensorData) {

  //var i = $('#'+SensorData._id+' .index').html();
  var html = SensorData.temp;
  $("#"+SensorData._id+' .sensor-temp').html(html);
  html = "<b class=\"online\" >online</b>";
  $("#"+SensorData._id+' .sensor-status').html(html);
  html = SensorData.date;
  $("#"+SensorData._id+' .sensor-date').html(html);
  //console.log(html);

});
socket.on('sensor disconnect', function(data) {

  // var i = $('#'+SensorData._id+' .index').html();
  // var html = "<td class=\"index\">"+i+"</td>";
  // html += "<td>"+SensorData.name+"</td>";
  // html += "<td>"+SensorData.temp+"</td>";
  // html += "<td><b class=\"online\">online</b></td>";
  // html += "<td>"+SensorData.date+"</td>";
  //
  // // html += "<div>Name: "+SensorData.name+"</div>";
  // // html += "<div>temp: "+SensorData.temp+"</div>";
  // // html += "<div>onConnect: "+SensorData.onConnect+"</div>";
  // //var selector = "#"+SensorData._id;
  // $("#"+SensorData._id).html(html);
  var html = "<b class=\"offline\" >offline</b>";
  $("#"+data.disconnectSensorID+' .sensor-status').html(html);
  html = "?";
  $("#"+data.disconnectSensorID+' .sensor-temp').html(html);
  console.log("sensor disconnect :"+data.disconnectSensorID);

});
socket.on('disconnect', function () {
  console.log('Disconnected from server');
  alert("Disconnected from server");
});
