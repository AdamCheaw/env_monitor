const timeArray = [{
    interval: "5m",
    period: [
      '12am ~ 1am', '1am ~ 2am', '2am ~ 3am',
      '3am ~ 4am', '4am ~ 5am', '5am ~ 6am',
      '6am ~ 7am', '7am ~ 8am', '8am ~ 9am',
      '9am ~ 10am', '10am ~ 11am', '11am ~ 12pm',
      '12pm ~ 1pm', '1pm ~ 2pm', '2pm ~ 3pm',
      '3pm ~ 4pm', '4pm ~ 5pm', '5pm ~ 6pm',
      '6pm ~ 7pm', '7pm ~ 8pm', '8pm ~ 9pm',
      '9pm ~ 10pm', '10pm ~ 11pm', '11pm ~ 12am'
    ]
  },
  {
    interval: "30m",
    period: [
      '12am ~ 6am', '6am ~ 12pm', '12pm ~ 6pm', '6pm ~ 12am'
    ]
  },
  {
    interval: "1h",
    period: [
      '12am ~ 12pm', '12pm ~ 12am'
    ]
  }
];
var chart;
//finding the max range value in array
function findMaxRange(array) {
  var max = 0;
  array.forEach(num => {
    if(num !== null && max < num) {
      max = num;
    }
  });
  return (Number((max / 10).toFixed(0)) + 1) * 10;
}
//finding the min range value in array
function findMinRange(array) {
  var min = 10000;
  array.forEach(num => {
    if(num !== null && min > num) {
      min = num;
    }
  });
  return (Number((min / 10).toFixed(0)) - 1) * 10;;
}

function initialTime(time) {

  let left = moment(time).minutes() % 5; //除於 5 分
  //finding end of the time
  let endOfTime = moment(time).subtract(left, 'minutes');
  //finding start of the time (end of the time - 1 hours)
  let startOfTime = moment(endOfTime).subtract(1, 'hours');
  return startOfTime;
}

function drawGraph(results, queryDate) {
  var labelArray = [];
  var dataArray = [];
  var maxRange = findMaxRange(dataArray);
  var minRange = findMinRange(dataArray);
  if(results === undefined) {
    let startOfTime = initialTime(queryDate || moment());
    //create a empty data array
    for(let i = 0; i < 12; i++) {
      labelArray.push(moment.parseZone(startOfTime).local().format('h:mm a'))
      dataArray.push(null);
      startOfTime = moment(startOfTime).add(5, 'minutes');
    }
    //finding the range
    maxRange = 50;
    minRange = 0;
  } else {
    results.forEach(doc => {
      var date = moment.parseZone(doc.date).local().format('h:mm a');
      labelArray.push(date);
      dataArray.push(doc.value);
    })
    //finding the range
    maxRange = findMaxRange(dataArray);
    minRange = findMinRange(dataArray);
  }
  var ctx = document.getElementById('myChart').getContext('2d');

  chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
      labels: labelArray,
      datasets: [{
        label: "value",
        backgroundColor: '#9ee0c8',
        borderColor: '#319b74',
        data: dataArray
      }]
    },
    // Configuration options go here
    options: {
      responsive: true,
      title: {
        display: true,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: true
          }
        }],
        yAxes: [{
          gridLines: {
            display: true
          },
          ticks: {
            min: minRange,
            max: maxRange,
            stepSize: ((maxRange - minRange) > 20) ? 10 : 5
          }
        }]
      }
    }
  });
}


if(results !== undefined) {
  drawGraph(results, moment());
} else {
  $('#subtitle').text("No data available with this sensor");
  drawGraph(results, null);
}
$(document).ready(function() {
  $("#interval").change(function() {
    var intervalValue = $("#interval option:selected").val();
    var select = timeArray.filter(function(t) {
      return t.interval == intervalValue;
    })
    //console.log(select);
    if(select && select.length) {
      var html = "";

      if(select[0].interval == "5m") {
        let i = 1;
        console.log("interval has changed");
        select[0].period.forEach(thisPeriod => {
          html += `<option value='${i}'>${thisPeriod}</option>`;
          i += 1;
        })
      } else if(select[0].interval == "30m") {
        let i = 6;
        select[0].period.forEach(thisPeriod => {
          html += `<option value='${i}'>${thisPeriod}</option>`;
          i += 6;
        })
      } else if(select[0].interval == "1h") {
        let i = 12;
        select[0].period.forEach(thisPeriod => {
          html += `<option value='${i}'>${thisPeriod}</option>`;
          i -= 12;
        })
      }
      $("#period").prop('disabled', false);
      $("#period").html(html);
    } else {
      $("#period").prop('disabled', true);
      $("#period").html("<option value=''>...</option>");
    }
  });

  $("#query-btn").click(function() {
    var dayValue = $("#day option:selected").val();
    var timeIntervalValue = $("#interval option:selected").val();
    var periodValue = parseInt($("#period option:selected").val());
    //console.log(periodValue);
    var queryDate = moment()
      .set({ 'hour': (periodValue), 'minute': 0, "second": 0 })
      .subtract(dayValue, 'd');
    console.log(`${queryDate}`);
    console.log(`${moment.parseZone(queryDate).toISOString()}`);
    var data = {
      "queryDate": moment.parseZone(queryDate).toISOString(),
      "interval": timeIntervalValue
    };
    //chart.destroy();
    $.ajax({
      type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
      url: `/API/sensor/getHistoryData/${sensorID}`, // the url where we want to POST
      data: data, // our data object
      dataType: 'json', // what type of data do we expect back from the server
      encode: true,
      beforeSend: function() {
        console.log("sending ajax");
      },
      complete: function() {
        // $.LoadingOverlay("hide");
        // console.log("ajax send finish");
        // $("#myModal").modal("hide");
      },
      success: function(data) {
        if(data) {
          $('#subtitle').text("");
          chart.destroy();
          drawGraph(data, null);
        } else {
          $('#subtitle').text("No data available with this sensor");
          chart.destroy();
          drawGraph(undefined, queryDate);
        }
        // if(data.status == 200) {
        //
        // } else {
        //   $('#subtitle').text("No data available with this sensor");
        // }


        //console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    });

  });
});