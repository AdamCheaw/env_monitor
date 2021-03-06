var i = 1;
var sensorId, IP, port, name, type, value;
var publishCondition = [];
var timer = 0;
var loop;
var valueRange;
var sensors;
var probability;

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (+max - +min)) + +min;
  // return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getValueRangeByType(type) {
  let valueRange;
  switch (type) {
    case "temperature":
      valueRange = [20, 30];
      break;
    case "humidity":
      valueRange = [30, 50];
    case "volume":
      valueRange = [40, 80];
      break;
    case "pm2.5":
      valueRange = [10, 30];
      break;
    default:
      valueRange = [20, 30]
  }
  return valueRange
}

function getAllSensor(url) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      sensors = [];
      data.forEach(doc => {
        sensors.push({ name: doc.name, type: doc.type });
        $("#sensor-name").append(`<option>${doc.name}</option>`)
      });
    })
    .catch(err => {
      console.log(err);
    })
}

function postData(url = ``, data) {
  console.log(data);
  // Default options are marked with *
  return fetch(url, {
    method: "post", // *GET, POST, PUT, DELETE, etc.
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: "same-origin", // include, *same-origin, omit
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
    mode: 'cors'
  })
}
//changing publish condition according server response
function changePubCondition(condition, publishStatus) {
  if(publishStatus === 0) {
    console.log("publish condition stay still");
  } else if(publishStatus === 1) {
    console.log("publish condition had change to default");
    publishCondition = [];
  } else if(publishStatus === 2) {
    console.log("publish condition had change");
    console.log(condition);
    publishCondition = condition;
  }
  return;
}
//matching current value with publish condition
function matchingValue_byPubCondition(value, conditions) {
  let isMatch = false
  if(Array.isArray(conditions) && conditions.length === 0) {
    console.log("publish condition is default ");
    isMatch = true;
  } else {
    console.log("publish condition is advanced ");
    if(conditions[0] !== null) { //matching with greater
      isMatch = (conditions[0] < value) ? true : isMatch;
    }
    if(conditions[1] !== null) { //matching with lower
      isMatch = (conditions[1] > value) ? true : isMatch;
    }
  }
  console.log(`isMatch : ${isMatch}`);
  return isMatch
}

function startGenerateValue() {
  var isValueChange = getRandomValue(0, 10);
  var second = getRandomValue(10, 60) * 1000;
  timer += second;
  if(timer >= (180 * 1000)) { //2m 30s
    console.log(`${timer/1000}sc time up`);
    timer = second;
    var data = {
      sensorId: sensorId,
      value: value
    };
    postData(`http://${IP}:${port}/sensors/update`, data)
      .then(res => {
        console.log(res);
        return res.json();
      })
      .then(data => {
        console.log(data);
        changePubCondition(data.publishCondition, data.publishStatus);
      })
      .catch(error => {
        console.log("something went wrong");
        console.log(error)
      });
  } else if(isValueChange % probability !== 0) {
    console.log("value did not change");
    console.log(`current timer is ${timer/1000}sc`);
  } else {
    //do not let value out of limit
    if(value > valueRange[1] || value < valueRange[0]) {
      let randValue = getRandomFloat(0.1, 1.2); //generate random value
      value = (value > valueRange[1]) ? value -= randValue : value += randValue;
      value = Number(value.toFixed(1));
    } else {
      let upOrDown = getRandomValue(0, 2);
      let randValue = getRandomFloat(0.1, 1.2); //generate random value
      value = (upOrDown === 1) ? value += randValue : value -= randValue;
      value = Number(value.toFixed(1));
    }
    console.log("value is change");
    console.log(`value : ${value}`);
    //if true
    //publish value to server
    if(matchingValue_byPubCondition(value, publishCondition)) {
      var data = {
        sensorId: sensorId,
        value: value
      };
      timer = second;
      postData(`http://${IP}:${port}/sensors/update`, data)
        .then(res => {
          console.log(res);
          return res.json();
        })
        .then(data => {
          console.log(data);
          changePubCondition(data.publishCondition, data.publishStatus);
        })
        .catch(error => {
          console.log("something went wrong");
          console.log(error)
        });
    } else {
      console.log("value did not match publish condition");
    }

  }
  console.log(`next time to generate is ${second /1000}sc`);

  if(i > 0) {
    loop = setTimeout(startGenerateValue, second);
  }
}
//get all sensor info
getAllSensor(`http://localhost:3000/API/sensor`);
//check sensor name datalist being click
var eventKey = null;
$("#input-name").bind('keydown', function(ev) {
  eventKey = ev.which; //get keydown value when this input being key in
});
//when sensor name input being change
$("#input-name").bind('input', function(ev) {
  //check if being click or being keydown
  //if datalist being clicked
  if($(this).val() !== "" && (eventKey == null || eventKey == undefined)) {
    let sensor = sensors.find(doc => doc.name == $(this).val());
    $("#input-type").val(sensor.type); //change the type
  }
});

$('#input-submit').click(function(e) {
  IP = $("#input-IP").val();
  port = $("#input-port").val();
  name = $("#input-name").val();
  type = $("#input-type").val();
  probability = Number($("#sensitive").val());
  valueRange = getValueRangeByType(type);
  value = Number(getRandomFloat(valueRange[0], valueRange[1]).toFixed(1));
  var data = {
    "name": name,
    "value": value,
    "type": type
  };
  //console.log(data);
  //postData(`http://localhost:3000/sensors/insert`, data)
  postData(`http://${IP}:${port}/sensors/insert`, data)
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data => {
      if(data.sensorId) {
        sensorId = data.sensorId;
        var second = getRandomValue(10, 60) * 1000;
        console.log(`initial timer is ${second /1000}sc`);
        timer += second;
        changePubCondition(data.publishCondition, data.publishStatus);
        loop = setTimeout(startGenerateValue, second);
      }
    })
    .catch(error => {
      console.log("something went wrong");
      console.log(error);
    });
});