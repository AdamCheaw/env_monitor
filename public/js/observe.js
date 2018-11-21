var socket = io();
$('#sub-table').on('click', '.unsubBtn', function(e) {
  idClicked = e.target.id;//get btn clicked id
  idClicked = idClicked.replace('unsubBtn-', '');
  console.log("idClicked: "+idClicked);
  if(idClicked)
  {
    var data = {
        "subscribeListID" : idClicked
    };
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/getData/unsubscribe', // the url where we want to POST
        data        : data, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true,
        beforeSend: function(){
          // $.LoadingOverlay("show", {
          //   image       : "",
          //   fontawesome : "fa fa-cog fa-spin"
          // });
        },
        complete: function(){
           // $.LoadingOverlay("hide");
           // console.log("ajax send finish");
           // $("#myModal").modal("hide");
        },
        success: function(data){
          $("#unsubBtn-"+idClicked).parent().parent().remove();
          alert("unsubscribe success!");
        },
        error: function(){
          alert("unsubscribe failed!");
        }
    })

  }
  else {

  }

});

$(document).ready(function() {

});
socket.on('connect', function () {
  console.log('Connected to server');
  console.log('user: '+name);
  console.log('socket id:'+socket.id );
  socket.emit('auth',{name});

});
socket.on('notification', function(SensorData) {

  //var i = $('#'+SensorData._id+' .index').html();
  var html = ""
  if(SensorData.option == "default") {
    html = SensorData.temp;
  }
  else {
    SensorData.condition.forEach(thisCondition => {
      if(thisCondition.type == "max" && Number(SensorData.temp) > Number(thisCondition.value)) {
        value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
        console.log(thisCondition.value);
      }
      else if (thisCondition.type == "min" && Number(SensorData.temp) < Number(thisCondition.value)) {
        value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
      }
      else if(thisCondition.type == "precision")
      {
        value = doc._sensorID.temp;
      }
      else if(thisCondition.type == "equal" && Number(SensorData.temp) == Number(thisCondition.value)) {
        value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
      }
      else if(
        thisCondition.type == "between" && (
           Number(SensorData.temp) > Number(thisCondition.minValue) &&
           Number(SensorData.temp) < Number(thisCondition.maxValue)
        )
      ) {
        value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
      }
      else {
        value = '<span class="font-safe"><i class="icon-star"></i></span>';
      }
    });
    html = value;
  }
  //temp value
  $("#"+SensorData._id+' .sensor-temp').html(html);
  //status
  html = "<b class=\"online\" >online</b>";
  $("#"+SensorData._id+' .sensor-status').html(html);
  //date
  html = moment.parseZone(SensorData.date).local().format('YYYY MMM Do, h:mm:ssa');
  $("#"+SensorData._id+' .sensor-date').html(html);
  console.log("listen a notification");
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
