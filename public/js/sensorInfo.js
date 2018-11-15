const timeArray = [
  {
    interval: "5m",
    period: [
      '12am ~ 1am','1am ~ 2am','2am ~ 3am',
      '3am ~ 4am','4am ~ 5am','5am ~ 6am',
      '6am ~ 7am','7am ~ 8am','8am ~ 9am',
      '9am ~ 10am','10am ~ 11am','11am ~ 12pm',
      '12pm ~ 1pm','1pm ~ 2pm','2pm ~ 3pm',
      '3pm ~ 4pm','4pm ~ 5pm','5pm ~ 6pm',
      '6pm ~ 7pm','7pm ~ 8pm','8pm ~ 9pm',
      '9pm ~ 10pm','10pm ~ 11pm','11pm ~ 12am'
    ]
  },
  {
    interval: "30m",
    period: [
      '12am ~ 6am','6am ~ 12pm','12pm ~ 6pm','6pm ~ 12am'
    ]
  },
  {
    interval: "1h",
    period: [
      '12am ~ 12pm','12pm ~ 12am'
    ]
  }
];
function drawGraph(results) {
  var labelArray = [];
  var dataArray = [];
  results.forEach(doc => {
    var date = moment.parseZone(doc.date).local().format('h:mm a');
    labelArray.push(date);
    dataArray.push(doc.value);
  })
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: labelArray,
        datasets: [{
            label: "My First dataset",
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
						text: "title"
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
								min: 0,
								max: 50,
								stepSize: 10
							}
						}]
					}
				}
  });
}


if(results &&  results.length) {
  drawGraph(results);
}
else {
  $('#subtitle').text("No data available with this sensor");
}
$(document).ready(function() {
  $("#interval").change(function() {

    var intervalValue = $( "#interval option:selected" ).val();

    var select = timeArray.filter(function(t){
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
          i +=1 ;
        })
      }
      else if(select[0].interval == "30m") {
        let i = 6;
        select[0].period.forEach(thisPeriod => {
          html += `<option value='${i}'>${thisPeriod}</option>`;
          i +=6 ;
        })
      }
      else if(select[0].interval == "1h") {
        let i = 12;
        select[0].period.forEach(thisPeriod => {
          html += `<option value='${i}'>${thisPeriod}</option>`;
          i -=12 ;
        })
      }

      $( "#period" ).prop('disabled', false);
      $( "#period" ).html(html);
    }
    else {
      $( "#period" ).prop('disabled', true);
      $( "#period" ).html("<option value=''>...</option>");
    }
  });

  $( "#query-btn" ).click(function() {
    var dayValue = $("#day option:selected").val();
    var timeIntervalValue = $("#interval option:selected").val();
    var periodValue = parseInt($("#period option:selected").val());
    //console.log(periodValue);
    var queryDate =  moment()
      .set({'hour': (periodValue),'minute': 0, "second": 0})
      .subtract(dayValue,'d');
    console.log(`${queryDate}`);
    console.log(`${moment.parseZone(queryDate).toISOString()}`);
    var data = {
      "sensorID":sensorID,
      "queryDate":moment.parseZone(queryDate).toISOString(),
      "interval":timeIntervalValue
    };
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/getData/getHistoryData', // the url where we want to POST
        data        : data, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true,
        beforeSend: function(){
          console.log("sending ajax");
        },
        complete: function(){
           // $.LoadingOverlay("hide");
           // console.log("ajax send finish");
           // $("#myModal").modal("hide");
        },
        success: function(data){
          drawGraph(data);
          //console.log(data);
        },
        error: function(err){
          console.log(err);
        }
    });

  });
});
