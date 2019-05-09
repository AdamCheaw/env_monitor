var sensorId, IP, port, name, type, value;


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

//sending register msg
$('#registerBtn').click(function(e) {
  IP = $("#input-IP").val();
  port = $("#input-port").val();
  name = $("#input-name").val();
  type = $("#input-type").val();
  value = $("#input-value").val();
  var data = {
    "name": name,
    "value": value,
    "type": type
  };
  console.log("sending register msg");
  postData(`http://${IP}:${port}/sensors/insert`, data)
    .then(res => {

      return res.json();
    })
    .then(data => {
      console.log(data);
      if(data.sensorId) {
        sensorId = data.sensorId;
        $("#publishBtn").prop('disabled', false);
        $("#registerBtn").prop('disabled', true);
      }
    })
    .catch(error => {
      console.log("something went wrong");
      console.log(error);
    });
});
//end sending register msg
//sending publish msg
$('#publishBtn').click(function(e) {
  value = $("#input-value").val();
  var data = {
    sensorId: sensorId,
    value: value
  };
  console.log("sending publish msg");
  postData(`http://${IP}:${port}/sensors/update`, data)
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => {
      console.log(err);
    })
});
////end sending publish msg