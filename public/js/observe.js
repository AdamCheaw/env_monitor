const socket = io().connect('http://localhost:3000');
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
  let onConnectStatus;
  let date = moment.parseZone(docs.date).local().format('YYYY MMM Do, h:mm:ssa');
  if(docs._sensorID[0].onConnect) {
    onConnectStatus = "online";
    if(docs.option == "default") {
      html = `<span class="font-blue">${docs._sensorID[0].temp}</span>`;
    }
    else if(docs.option == "advanced") {
      if(filterByCondition(docs.condition,docs._sensorID[0].temp)){
        html = `<span class="font-warning"><i class="icon-warning-sign"></i> </span>`;
      }
      else {
        html = '<span class="font-safe"><i class="icon-star font-lg"></i></span>';
      }
    }
  }
  else if(!docs._sensorID[0].onConnect) {
    onConnectStatus = "offline";
    html = '<span class="font-yellow"><i class="icon-question-sign"></i></span>'
  }
  //change Subscription value
  $("#subscription-"+docs._id+" .sensor-value").html(html);
  //change onConnect status
  $("#subscription-"+docs._id+" .media-body .span10 b")
    .removeClass().addClass(onConnectStatus).text(onConnectStatus);
  //change last updated 's date
  $("#subscription-"+docs._id+" .media-body .span10 span").text(date);
  //$("#subscription-"+docs._id+" .sensor-value").html(html);

}
//changing group subscription 's table info
const changeTableView = (docs) => {
  let condition = docs.condition;
  docs._sensorID.forEach(doc => {
    let value = date = status = "";
    // if(filterByCondition(condition,doc.temp)) {
    //   value = `<span class="font-warning"><i class="icon-warning-sign"></i></span>`;
    // }
    // else {
    //   value = `<span class="font-safe"><i class="icon-star font-md"></i></span>`;
    // }
    if(doc.onConnect){
      status = '<b class="online">online</b>';
    }
    else {
      status = '<b class="offline">offline</b>';
    }
    date = moment.parseZone(doc.date).local().format('YYYY MMM Do, h:mm:ssa');
    // $(`#table-row-${doc._id} .value`).html(value);
    $(`#table-row-${doc._id} .date`).html(date);
    $(`#table-row-${doc._id} .status`).html(status);
  });
}
//changing group subscription 's status (safe or not safe) symbol
const changeGroupStatus = (docs) => {
  let sensors = docs._sensorID;
  var isSafe;
  let matchNum = 0;
  if(docs.groupType == "AND") {
    //all the sensor value need to match with condition
    isSafe = true;
    for(let i = 0;i < sensors.length;i++) {
      if(!sensors[i].onConnect) {
        isSafe = null;
        break;
      }
      //a sensor match condition , matchNum +1
      if(filterByCondition(docs.condition,sensors[i].temp)) {
        matchNum += 1;
      }
    }
    if(matchNum === sensors.length && isSafe !== null){
      isSafe = false;
    }
    console.log("check finish");
  }
  else if(docs.groupType == "OR") {
    //just need a sensor matching condition
    isSafe = true;
    for(let i = 0;i < sensors.length;i++) {
      if(!sensors[i].onConnect) {
        isSafe = null;
        break;
      }
      //if a single sensor matching condition ,matchNum + 1
      if(filterByCondition(docs.condition,sensors[i].temp)) {
        matchNum += 1;
      }
    }
    if(matchNum > 0 && isSafe !== null) {
      isSafe = false;
    }
  }
  if(isSafe === null) {
    html = '<span class="font-yellow"><i class="icon-question-sign"></i></span>';
    $("#subscription-"+docs._id+" .sensor-value").html(html);
  }
  else if(isSafe) {
    html = '<span class="font-safe"><i class="icon-star"></i></span>';
    $("#subscription-"+docs._id+" .sensor-value").html(html);
  }
  else if(!isSafe) {

    html = '<span class="font-warning"><i class="icon-warning-sign "></i></span>';
    $("#subscription-"+docs._id+" .sensor-value").html(html);
  }
}
//when sensor disconnect , change status to offline
const handleSensorDisconnect = (doc) => {
  if(doc.groupType) { //groupType != null
    //change to offline
    $(`#subscription-${doc._id} #table-row-${doc.sensorID} .status`)
      .html('<b class="offline">offline</b>');
    //change status icon
    $("#subscription-"+doc._id+" .media-body .span2 .sensor-value")
      .html('<span class="font-yellow"><i class="icon-question-sign"></i></span>')
  }
  else {
    $("#subscription-"+doc._id+" .media-body .span10 b")
      .text("offline").removeClass("online").addClass("offline");
    $("#subscription-"+doc._id+" .media-body .span2 .sensor-value")
      .html('<span class="font-yellow"><i class="icon-question-sign"></i></span>')
  }
}
//handle when editBtn being click and change modal show up 's views
const handleEditSubscription = (doc,id) => {
  //scrisrc from ./editSubscription.js
  changeEditSubView(doc,id);
  mapSubscriptionToEditForm(doc);
}
$(document).ready(function() {
  //delete a subscription
  $('#subscription-1').on('click', '.unsubBtn', function(e) {
    let idClicked = e.target.id;//get btn clicked id
    idClicked = idClicked.replace('unsubBtn-', '');
    // console.log("idClicked: "+idClicked);
    if(idClicked)
    {
      var data = {
          "subscribeListID" : idClicked
      };
      $.ajax({
          type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
          url         : '/observe/unsubscribe', // the url where we want to POST
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
  //edit a subscription
  $('#subscription-1').on('click', '.editBtn' ,function (e) {
    let idClicked = e.target.id;//get btn clicked id
    idClicked = idClicked.replace('editBtn-', '');
    if(idClicked) {
      var data = {
        "_id" : idClicked
      };
      $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/observe/getSubscriptionInfo', // the url where we want to POST
        data        : data, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true,
        beforeSend: function(){
          $.LoadingOverlay("show", {
            image       : "",
            fontawesome : "fa fa-cog fa-spin"
          });
        },
        complete: function(){
           $.LoadingOverlay("hide");
           console.log("ajax send finish");

        },
        success: function(data){
          handleEditSubscription(data,data._id);

          $("#editSub-Modal").modal("show");
          console.log(data);
        },
        error: function(){
          toastr.error('something went wrong!')
        }
      });
    }
  });
  //confirm edit this subscription
  $('#editSub-Modal').on('click', '.edit-submit' ,function (e) {
    let idClicked = e.target.id;//get btn clicked id
    idClicked = idClicked.replace('submit-', '');
    if(idClicked) {
      let afterEdit  = getEditFormSubmit();
      afterEdit._id = idClicked;
      console.log(JSON.stringify(afterEdit));
      // let data = {
      //   "_id" : idClicked,
      // };
      $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/observe/updateSubscriptionInfo', // the url where we want to POST
        data        : afterEdit, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true,
        beforeSend: function(){
          $("#editSub-Modal .edit-submit").attr('disabled','disabled').text('Sending');
        },
        complete: function(){
           // $.LoadingOverlay("hide");
           console.log("ajax send finish");

        },
        success: function(data){
          $("#editSub-Modal .edit-submit").removeAttr('disabled').text('Confirm');
          swal("edit subscription success", " ", "success")
            .then(() => {
              window.location.reload();
            })
          console.log(data);
        },
        error: function(){
          toastr.error('something went wrong!')
        }
      });
    }
  });
});

// handle socket msg
socket.on('connect', function () {
  console.log('Connected to server');
  console.log('user: '+name);
  console.log('socket id:'+socket.id );
  socket.emit('auth',{name});

});
socket.on('notification', function(subscription) {
  if(subscription.groupType == 'AND') {
    changeGroupStatus(subscription);
    changeTableView(subscription);
  }
  else if(subscription.groupType == 'OR') {
    changeTableView(subscription);
    changeGroupStatus(subscription);
  }
  else {
    changeOneSubscriptionView(subscription);
  }

  console.log("listen a notification");
  console.log(subscription);
});
socket.on('sensor connect', function(subscription) {
  console.log("a sensor is connect");
  console.log(subscription);
  if(subscription.groupType == 'AND' || subscription.groupType == 'OR') {
    changeGroupStatus(subscription);
    changeTableView(subscription);
  }
  else {
    changeOneSubscriptionView(subscription);
  }
})
socket.on('sensor disconnect', function(data) {
  handleSensorDisconnect(data)
  // var html = "<b class=\"offline\" >offline</b>";
  // $("#"+data.disconnectSensorID+' .sensor-status').html(html);
  // html = "?";
  // $("#"+data.disconnectSensorID+' .sensor-temp').html(html);
  console.log("sensor disconnect :"+data._id);
});
socket.on('disconnect', function () {
  console.log('Disconnected from server');
  alert("Disconnected from server");
});
