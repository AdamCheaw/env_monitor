const socket = io();
//filter sensor value with condition to finding match or not
const filterByCondition = (condition,sensorValue) => {
  for(let i = 0;i < condition.length;i++) {
    if(condition[i].type == "max" && Number(sensorValue) > Number(condition[i].value)) {
      return true;
    }
    else if(condition[i].type == "min" && Number(sensorValue) < Number(condition[i].value)) {
      return true;
    }
    else if (condition[i].type == "precision") {
      return true;
    }
    else if (condition[i].type == "equal" && Number(sensorValue) == Number(condition[i].value)) {
      return true;
    }
    else if (condition[i].type == "between" &&
             ( Number(sensorValue) > Number(condition[i].minValue) &&
               Number(sensorValue) < Number(condition[i].maxValue)
             )
            )
    {
      return true;
    }
  }
  return false;
}
//changing single subscription 's view
const changeOneSubscriptionView = (docs) => {
  let html = "";
  if(docs.option == "default") {
    html = `<span class="font-blue">${docs._sensorID[0].temp}</span>`;
  }
  else if(docs.option == "advanced") {
    if(filterByCondition(docs.condition,docs._sensorID[0].temp)){
      html = `<span class="font-warning"><i class="icon-warning-sign font-md"></i> ${docs._sensorID[0].temp}</span>`;
    }
    else {
      html = '<span class="font-safe"><i class="icon-star font-lg"></i></span>';
    }
  }
  //change Subscription value
  $("#subscription-"+docs._id+" .sensor-value").html(html);
}
//changing group subscription 's table info
const changeTableView = (docs) => {
  let condition = docs.condition;
  docs._sensorID.forEach(doc => {
    let value = date = status = "";
    if(filterByCondition(condition,doc.temp)) {
      value = `<span class="font-warning"><i class="icon-warning-sign font-md"></i> ${doc.temp}</span>`;
    }
    else {
      value = `<span class="font-safe"><i class="icon-star font-md"></i></span>`;
    }
    if(doc.onConnect){
      status = '<b class="online">online</b>';
    }
    else {
      status = '<b class="offline">offline</b>';
    }
    date = moment.parseZone(doc.date).local().format('YYYY MMM Do, h:mm:ssa');
    $(`#table-row-${doc._id} .value`).html(value);
    $(`#table-row-${doc._id} .date`).html(date);
    $(`#table-row-${doc._id} .status`).html(status);
  });
}
//changing group subscription 's status (safe or not safe) symbol
const changeGroupStatus = (docs) => {
  let sensors = docs._sensorID;
  var isSafe
  if(docs.groupType == "AND") {
    //all the sensor value need to match with condition
    isSafe = false;
    for(let i = 0;i < sensors.length;i++) {
      if(!sensors[i].onConnect) {
        isSafe = false;
        break;
      }
      //if a single sensor did not match condition , return safe mode
      //console.log(filterByCondition(docs.condition,sensors[i].temp));
      if(!filterByCondition(docs.condition,sensors[i].temp)) {
        isSafe = true;
        break;
      }
    }
    console.log("check finish");
  }
  else if(docs.groupType == "OR") {
    //just need a sensor matching condition
    isSafe = true;
    for(let i = 0;i < sensors.length;i++) {
      if(!sensors[i].onConnect) {
        isSafe = false;
        break;
      }
      //if a single sensor matching condition , return no safe mode
      if(filterByCondition(docs.condition,sensors[i].temp)) {
        isSafe = false;
        break;
      }
    }
  }
  if(isSafe) {
    html = '<span class="font-safe"><i class="icon-star"></i></span>';
    $("#subscription-"+docs._id+" .sensor-value").html(html);
  }
  else if(!isSafe) {

    html = '<span class="font-warning"><i class="icon-warning-sign "></i></span>';
    $("#subscription-"+docs._id+" .sensor-value").html(html);
  }

}
$('#subscription-1').on('click', '.unsubBtn', function(e) {
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
          $("#subscription-"+idClicked).parent().parent().remove();
          toastr.success('unsubscribe success!')
        },
        error: function(){
          toastr.error('unsubscribe failed!')
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
  if(SensorData.groupType == 'AND') {
    changeGroupStatus(SensorData);
    changeTableView(SensorData);
  }
  else if(SensorData.groupType == 'OR') {
    changeTableView(SensorData);
    changeGroupStatus(SensorData);
  }
  else {
    changeOneSubscriptionView(SensorData);
  }
  //var i = $('#'+SensorData._id+' .index').html();
  // var html = ""
  // if(SensorData.option == "default") {
  //   html = SensorData.temp;
  // }
  // else {
  //   SensorData.condition.forEach(thisCondition => {
  //     if(thisCondition.type == "max" && Number(SensorData.temp) > Number(thisCondition.value)) {
  //       value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
  //       console.log(thisCondition.value);
  //     }
  //     else if (thisCondition.type == "min" && Number(SensorData.temp) < Number(thisCondition.value)) {
  //       value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
  //     }
  //     else if(thisCondition.type == "precision")
  //     {
  //       value = doc._sensorID.temp;
  //     }
  //     else if(thisCondition.type == "equal" && Number(SensorData.temp) == Number(thisCondition.value)) {
  //       value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
  //     }
  //     else if(
  //       thisCondition.type == "between" && (
  //          Number(SensorData.temp) > Number(thisCondition.minValue) &&
  //          Number(SensorData.temp) < Number(thisCondition.maxValue)
  //       )
  //     ) {
  //       value = '<span class="font-warning"><i class="icon-warning-sign"></i> '+SensorData.temp+'</span>';
  //     }
  //     else {
  //       value = '<span class="font-safe"><i class="icon-star"></i></span>';
  //     }
  //   });
  //   html = value;
  // }
  // //temp value
  // $("#"+SensorData._id+' .sensor-temp').html(html);
  // //status
  // html = "<b class=\"online\" >online</b>";
  // $("#"+SensorData._id+' .sensor-status').html(html);
  // //date
  // html = moment.parseZone(SensorData.date).local().format('YYYY MMM Do, h:mm:ssa');
  // $("#"+SensorData._id+' .sensor-date').html(html);
  console.log("listen a notification");
  console.log(SensorData);
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
