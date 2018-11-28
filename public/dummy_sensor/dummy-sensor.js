var i = 1;
var sensorId , IP , port , name , type , temp;
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function startSending()
{
  var temp = getRandomValue(20,25);
  console.log(temp);
  var second = getRandomValue(10,60) * 1000;
  console.log(second);
  var data = {
    sensorId : sensorId,
    temp : temp
  };
  postData(`http://${IP}:${port}/sensors/update`, data)
  .then(res => {return res.json();})
  .then(data => {console.log(data);}) // JSON-string from `response.json()` call
  .catch(error => console.log(error));
  if(i > 0)
  {
    setTimeout(startSending ,second);
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
$('#input-submit').click(function(e){
  IP = $("#input-IP").val();
  port = $("#input-port").val();
  name = $("#input-name").val();
  type = $("#input-type").val();
  temp = getRandomValue(20,25);
  var data = {
    "name":name,
    "temp":temp,
    "type":type
  };
  //console.log(data);
  //postData(`http://localhost:3000/sensors/insert`, data)
  postData(`http://${IP}:${port}/sensors/insert`, data)
  .then(res => {
    return res.json();
  })
  .then(data => {
    if(data.sensorId) {
      sensorId = data.sensorId;
      setTimeout(startSending , getRandomValue(10,60) * 1000);
    }
  })
  .catch(error => console.log(error));
});
