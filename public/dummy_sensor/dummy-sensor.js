var i = 1;
var sensorId, IP, port, name, type, value;
var timer = 0;
var loop;

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (+max - +min)) + +min;
  // return Math.floor(Math.random() * (max - min) + min);
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
      }) // JSON-string from `response.json()` call
      .catch(error => {
        console.log("something went wrong");
        console.log(error)
      });
  } else if(isValueChange % 3 !== 0) {
    console.log("value did not change");
    console.log(`current timer is ${timer/1000}sc`);
  } else {
    timer = second;
    var upOrDown = getRandomValue(0, 2);
    value = (upOrDown === 1) ? value += 1 : value -= 1;
    console.log("value is change");
    console.log(`value : ${value}`);
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
      }) // JSON-string from `response.json()` call
      .catch(error => {
        console.log("something went wrong");
        console.log(error)
      });
  }
  console.log(`next time to generate is ${second /1000}sc`);

  if(i > 0) {
    loop = setTimeout(startGenerateValue, second);
  }
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
$('#input-submit').click(function(e) {
  IP = $("#input-IP").val();
  port = $("#input-port").val();
  name = $("#input-name").val();
  type = $("#input-type").val();
  value = getRandomValue(20, 30);
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
        loop = setTimeout(startGenerateValue, second);
      }
    })
    .catch(error => {
      console.log("something went wrong");
      console.log(error);
    });
});