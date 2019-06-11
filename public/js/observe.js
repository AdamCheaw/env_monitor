const socket = io().connect('http://localhost:3000');
var countNotification = 0 //for testing
//check sensor value is reach condition
const checkIsReachCondition = (condition, sensorValue) => {
  for(let i = 0; i < condition.length; i++) {
    if(condition[i].type == "greater" &&
      Number(sensorValue) > Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "lower" &&
      Number(sensorValue) < Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "precision") {
      return true;
    } else if(condition[i].type == "equal" &&
      Number(sensorValue) == Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "between" &&
      (Number(sensorValue) > Number(condition[i].minValue) &&
        Number(sensorValue) < Number(condition[i].maxValue)
      )
    ) {
      return true;
    }
  }
  return false;
}
//check if the group matching condition according groupType
const checkGroupStatus = (docs) => {

  let sensors = docs._sensorID;
  var isSafe;
  let matchNum = 0;
  if(docs.groupType == "AND") {
    //all the sensor value need to match with condition
    isSafe = true;
    for(let i = 0; i < sensors.length; i++) {
      if(!sensors[i].onConnect) {
        isSafe = null;
        break;
      }
      //a sensor match condition , matchNum +1
      if(checkIsReachCondition(docs.condition, sensors[i].value)) {
        matchNum += 1;
      }
    }
    if(matchNum === sensors.length && isSafe !== null) {
      isSafe = false;
    }
    console.log("check finish");
  } else if(docs.groupType == "OR") {
    //just need a sensor matching condition
    isSafe = true;
    for(let i = 0; i < sensors.length; i++) {
      if(!sensors[i].onConnect) {
        isSafe = null;
        break;
      }
      //if a single sensor matching condition ,matchNum + 1
      if(checkIsReachCondition(docs.condition, sensors[i].value)) {
        matchNum += 1;
      }
    }
    if(matchNum > 0 && isSafe !== null) {
      isSafe = false;
    }
  }
  return isSafe;
}
//changing single subscription 's view
const changeOneSubscriptionView = (docs) => {
  let html = "";
  let onConnectStatus;
  let animated = "";
  let date = moment.parseZone(docs.date).local().format('YYYY MMM Do, h:mm:ssa');
  if(docs._sensorID[0].onConnect) {
    onConnectStatus = "online";
    animated = "animated infinite slow bounceIn";
    if(docs.option == "default") {

      html = `<span class="font-blue">${docs._sensorID[0].value}</span>`;
    } else if(docs.option == "advanced") {
      if(checkIsReachCondition(docs.condition, docs._sensorID[0].value)) {
        html = `<span class="font-warning">
                  <i class="icon-warning-sign"></i>
                </span>`;
      } else {
        html = '<span class="font-safe"><i class="icon-star font-lg"></i></span>';
      }
    }
  } else if(!docs._sensorID[0].onConnect) {

    onConnectStatus = "offline";
    html = '<span class="font-yellow"><i class="icon-question-sign"></i></span>'
  }
  //change Subscription value
  $("#subscription-" + docs._id + " .sensor-value div")
    .removeClass().addClass(animated).html(html);
  //change onConnect status
  $("#subscription-" + docs._id + " .sub-info b")
    .removeClass().addClass(onConnectStatus).text(onConnectStatus);
  //change last updated 's date
  $("#subscription-" + docs._id + " .sub-info .date").text(date);
}
//changing group subscription 's table info
const changeTableView = (docs) => {
  let condition = docs.condition;
  docs._sensorID.forEach(doc => {
    let value = date = status = "";
    if(doc.onConnect) {
      status = '<b class="online">online</b>';
    } else {
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
  let isSafe = checkGroupStatus(docs);
  if(isSafe === null) {
    html = '<span class="font-yellow"><i class="icon-question-sign"></i></span>';
    $("#subscription-" + docs._id + " .sensor-value div")
      .removeClass().html(html);
  } else if(isSafe) {
    html = '<span class="font-safe"><i class="icon-star"></i></span>';
    $("#subscription-" + docs._id + " .sensor-value div")
      .removeClass().addClass("animated infinite slow bounceIn").html(html);
  } else if(!isSafe) {

    html = '<span class="font-warning"><i class="icon-warning-sign "></i></span>';
    $("#subscription-" + docs._id + " .sensor-value div")
      .removeClass().addClass("animated infinite slow bounceIn").html(html);

  }
}
//mapping group subscription 's status (safe or not safe) to html tag
const mapGroupStatusToHTMLTag = (docs) => {
  var isSafe = checkGroupStatus(docs)
  if(isSafe === null) {
    html = '<div class="">' +
      '<span class="font-yellow"><i class="icon-question-sign"></i></span>' +
      '</div>';
  } else if(isSafe) {
    html = '<div class="animated infinite slow bounceIn">' +
      '<span class="font-safe"><i class="icon-star "></i></span>' +
      '</div>';
  } else if(!isSafe) {

    html = '<div class="animated infinite slow bounceIn">' +
      '<span class="font-warning"><i class="icon-warning-sign "></i></span>' +
      '</div>';
  }
  return html
}
//mapping subscription 's status (safe or not safe) to html tag
const mapStatusToHTMLTag = (docs) => {
  let html;
  if(docs._sensorID[0].onConnect) { //onConnet
    onConnectStatus = "online";
    animated = "animated infinite slow bounceIn";
    if(docs.option == "default") { //default status
      html = '<div class="animated infinite slow bounceIn">' +
        `<span class="font-blue">${docs._sensorID[0].value}</span>` +
        '</div>';
    } else if(docs.option == "advanced") {
      //danger status
      if(checkIsReachCondition(docs.condition, docs._sensorID[0].value)) {
        html = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-warning"><i class="icon-warning-sign "></i></span>' +
          '</div>';
      } else { //safe status
        html = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-safe"><i class="icon-star "></i></span>' +
          '</div>';
      }
    }
  } else if(!docs._sensorID[0].onConnect) { //not onConnect
    html = '<div class="">' +
      '<span class="font-yellow"><i class="icon-question-sign"></i></span>' +
      '</div>';
  }
  return html
}
//when sensor disconnect , change status to offline
const handleSensorDisconnect = (doc) => {
  if(doc.groupType) { //groupType != null
    //change to offline
    $(`#subscription-${doc._id} #table-row-${doc.sensorID} .status`)
      .html('<b class="offline">offline</b>');
    //change status icon
    $("#subscription-" + doc._id + " .sensor-value div")
      .removeClass()
      .html('<span class="font-yellow"><i class="icon-question-sign"></i></span>')
  } else {
    $("#subscription-" + doc._id + " .sub-info b")
      .text("offline").removeClass("online").addClass("offline");
    $("#subscription-" + doc._id + " .sensor-value div")
      .removeClass()
      .html('<span class="font-yellow"><i class="icon-question-sign"></i></span>')
  }
}
//handle when editBtn being click and change modal show up 's views
const handleEditSubscription = (doc, id) => {
  //script src from ./editSubscription.js
  changeEditSubView(doc, id);
  mapSubscriptionToEditForm(doc);
}
//map condition to string for user readable
const mappingConditionToStr = (condition) => {
  if(condition.type == "greater") {
    return `greater than ${condition.value}`;
  } else if(condition.type == "lower") {
    return `lower than ${condition.value}`;
  } else if(condition.type == "equal") {
    return `equal to ${condition.value}`;
  } else if(condition.type == "precision") {} else if(condition.type == "between") {
    return `in between ${condition.minValue} ~ ${condition.maxValue}`;
  }
}
//merge all condition
const mapAllConditionsToStr = (conditions) => {
  var html = "";
  conditions.forEach((condition, index, arr) => {
    if(index == arr.length - 1) {
      html += mappingConditionToStr(condition);
    } else {
      html += mappingConditionToStr(condition) + " , ";
    }
  });
  return html;
}
//display subscription by Handlebars template
const displaySubscription = (docs) => {
  let subscriptionHTML = "";
  docs.forEach(doc => {
    if(doc.groupType !== null && doc.option === "advanced") {
      var scriptHtml = $("#groupSubscription-temp")[0].innerHTML;
      var template = Handlebars.compile(scriptHtml);
      var obj = {
        sub: doc,
        valueTag: mapGroupStatusToHTMLTag(doc),
        conditionTag: mapAllConditionsToStr(doc.condition)
      };
      subscriptionHTML += template(obj);
    } else {
      var scriptHtml = $("#subscription-temp")[0].innerHTML;
      var template = Handlebars.compile(scriptHtml);
      var obj = {
        sub: doc,
        valueTag: mapStatusToHTMLTag(doc),
        conditionTag: mapAllConditionsToStr(doc.condition)
      };
      subscriptionHTML += template(obj);
    }

  });
  //append subscrition list to observe page
  $("#subscription-1 .subscription-list").html(subscriptionHTML);
}
//update subscription's sensor info(ex: value, onConnect, date)
const updateSubscriptionInfo = (e, doc) => {
  if(e === "notification" || e === "connect") {
    //loop all local subscription
    for(let i = 0; i < theSubscriptions.length; i++) {
      if(theSubscriptions[i]._id === doc._id) { //find the match subscription
        //change the local sensor value
        let sensors = theSubscriptions[i]._sensorID;
        for(let j = 0; j < sensors.length; j++) {
          sensors[j].value = doc._sensorID[j].value;
          sensors[j].onConnect = doc._sensorID[j].onConnect;
          sensors[j].date = moment.parseZone(doc._sensorID[j].date)
            .local().format('YYYY MMM Do, h:mm:ssa');
        }
        theSubscriptions[i]._sensorID = sensors;
        console.log("change:");
        console.log(theSubscriptions[i]);
        break;
      }
    }
  } else if(e === "disconnect") {
    for(let i = 0; i < theSubscriptions.length; i++) {
      if(theSubscriptions[i]._id === doc._id) {
        let sensors = theSubscriptions[i]._sensorID;
        for(let j = 0; j < sensors.length; j++) {
          if(sensors[j]._id === doc.sensorID) {
            sensors[j].onConnect = false;
            sensors[j].date = moment().local().format('YYYY MMM Do, h:mm:ssa');
            break;
          }
        }
        theSubscriptions[i]._sensorID = sensors;
        console.log("change:");
        console.log(theSubscriptions[i]);
        break;
      }
    }
  }


}
//sort the local subscriptions
const sortSubscription = (sortBy) => {
  theSubscriptions.sort((a, b) => {
    // setting compare value
    let A, B;
    if(sortBy === "title") {
      A = a.title.toLowerCase();
      B = b.title.toLowerCase();
    } else if(sortBy === "date") {
      A = a._id.toString().substring(0, 8);
      B = b._id.toString().substring(0, 8);
    }
    //compare
    if(A < B) {
      return -1;
    }
    if(A > B) {
      return 1;
    }
    // equal
    return 0;
  });
}

//manage DOM change
$(document).ready(function() {
  // initial subscription
  displaySubscription(theSubscriptions);

  $.LoadingOverlay("hide");
  //delete a subscription
  $('#subscription-1').on('click', '.unsubBtn', function(e) {
    let idClicked = e.target.id; //get btn clicked id
    idClicked = idClicked.replace('unsubBtn-', '');
    // console.log("idClicked: "+idClicked);
    if(idClicked) {
      var data = {
        "subscriptionID": idClicked
      };
      $.ajax({
        type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url: '/API/subscription/unsubscribe', // the url where we want to POST
        data: data, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true,
        beforeSend: function(xhr) {
          if(localStorage.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
          }
        },
        complete: function() {
          // $.LoadingOverlay("hide");
          // console.log("ajax send finish");
          // $("#myModal").modal("hide");
        },
        success: function(data) {
          $("#subscription-" + idClicked).remove();
          toastr.success('unsubscribe success!')
        },
        error: function(err) {
          if(err.status == 401) {
            swal("invalid request", " please login to our system again...", "error")
              .then(() => {
                window.location.href = '/logout';
              });
          } else {
            toastr.error('unsubscribe failed!');
          }
        }
      })

    } else {

    }

  });
  //edit a subscription
  $('#subscription-1').on('click', '.editBtn', function(e) {
    let idClicked = e.target.id; //get btn clicked id
    idClicked = idClicked.replace('editBtn-', '');
    if(idClicked) {
      $.ajax({
        type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
        url: `/API/subscription/${idClicked}`, // the url where we want to POST
        dataType: 'json', // what type of data do we expect back from the server
        encode: true,
        beforeSend: function(xhr) {
          $.LoadingOverlay("show", {
            image: "",
            fontawesome: "fa fa-cog fa-spin"
          });
          if(localStorage.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
          }
        },
        complete: function() {
          $.LoadingOverlay("hide");
          console.log("ajax send finish");

        },
        success: function(data) {
          handleEditSubscription(data, data._id);

          $("#editSub-Modal").modal("show");
          console.log(data);
        },
        error: function(err) {
          if(err.status == 401) {
            swal("invalid request", " please login to our system again...", "error")
              .then(() => {
                window.location.href = '/logout';
              });
          } else {
            toastr.error('something went wrong!');
          }
        }
      });
    }
  });
  //confirm edit this subscription
  $('#editSub-Modal').on('click', '.edit-submit', function(e) {
    let idClicked = e.target.id; //get btn clicked id
    idClicked = idClicked.replace('submit-', '');
    if(idClicked) {
      let afterEdit = getEditFormSubmit();
      afterEdit._id = idClicked;
      console.log(JSON.stringify(afterEdit));
      $.ajax({
        type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url: '/API/subscription/updateSubscriptionInfo', // the url where we want to POST
        data: afterEdit, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true,
        beforeSend: function(xhr) {
          $("#editSub-Modal .edit-submit").attr('disabled', 'disabled').text('Sending');
          if(localStorage.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
          }
        },
        complete: function() {
          // $.LoadingOverlay("hide");
          console.log("ajax send finish");

        },
        success: function(data) {
          $("#editSub-Modal .edit-submit").removeAttr('disabled').text('Confirm');
          swal("edit subscription success", " ", "success")
            .then(() => {
              window.location.reload();
            })
          console.log(data);
        },
        error: function(err) {
          if(err.status == 401) {
            swal("invalid request", " please login to our system again...", "error")
              .then(() => {
                window.location.href = '/logout';
              });
          } else {
            toastr.error('something went wrong!');
          }
        }
      });
    }
  });
  //show subscription related sensor data
  $('#subscription-1').on('click', '.showDataBtn', function(e) {
    let idClicked = e.target.id; //get btn clicked id
    idClicked = idClicked.replace('dataDisplayBtn-', '');
    $.ajax({
      type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
      url: `/API/subscription/${idClicked}/sensors`, // the url where we want to POST
      dataType: 'json', // what type of data do we expect back from the server
      encode: true,
      beforeSend: function(xhr) {
        if(localStorage.token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.token);
        }
      },
      complete: function() {
        // $.LoadingOverlay("hide");
        console.log("ajax send finish");

      },
      success: function(data) {
        //get dataDisplayModal handlebars template
        let scriptHtml = $("#dataDisplayModal-temp")[0].innerHTML;
        //compile the handlebars template and return html
        let html = generateDataDisplayModalHTML(scriptHtml, data);
        $("#dataDisplayModal .modal-content").html(""); //clear content
        $("#dataDisplayModal .modal-content").append(html); //replace content
        $("#dataDisplayModal").modal("show"); //show modal
      },
      error: function(err) {
        if(err.status == 401) {
          swal("invalid request", " please login to our system again...", "error")
            .then(() => {
              window.location.href = '/logout';
            });
        } else {
          toastr.error('something went wrong!');
        }
      }
    });
  });
  //sorting dropdown btn being clicked
  $('#sortBtn').on('click', 'li', function(e) {
    e.preventDefault();
    //sorting the local subscriptions by btn being selected
    sortSubscription($(this).text().toLowerCase());
    //refresh the subscription view
    displaySubscription(theSubscriptions);
    //changing the sort btn value
    $('#sortBtn .btn:first-child').html($(this).text());
  })
});

// handle socket msg
socket.on('connect', function() {
  console.log('Connected to server');
  console.log('user: ' + name);
  console.log('socket id:' + socket.id);
  socket.emit('auth', {
    name
  });

});
socket.on('notification', function(subscription) {
  if(subscription.groupType == 'AND') {
    changeGroupStatus(subscription);
    changeTableView(subscription);
  } else if(subscription.groupType == 'OR') {
    changeTableView(subscription);
    changeGroupStatus(subscription);
  } else {
    changeOneSubscriptionView(subscription);
  }
  countNotification += 1;
  console.log("listen a notification");
  console.log(countNotification);
  // console.log(subscription);
  updateSubscriptionInfo("notification", subscription);
});
socket.on('sensor connect', function(subscription) {
  console.log("a sensor is connect");
  // console.log(subscription);
  if(subscription.groupType == 'AND' || subscription.groupType == 'OR') {
    changeGroupStatus(subscription);
    changeTableView(subscription);
  } else {
    changeOneSubscriptionView(subscription);
  }
  updateSubscriptionInfo("connect", subscription);
})
socket.on('sensor disconnect', function(data) {
  handleSensorDisconnect(data);
  console.log("sensor disconnect :" + data._id);
  updateSubscriptionInfo("disconnect", data);
});
socket.on('disconnect', function() {
  swal("Disconnected from server", "", "error")
    .then(() => {
      window.location.href = '/logout';
    });
});