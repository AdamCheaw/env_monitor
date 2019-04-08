var moment = require('moment');

// function standardDeviation(values) {
//   var avg = average(values);
//
//   var squareDiffs = values.map(function(value) {
//     var diff = value - avg;
//     var sqrDiff = diff * diff;
//     return sqrDiff;
//   });
//
//   var avgSquareDiff = average(squareDiffs);
//
//   var stdDev = Math.sqrt(avgSquareDiff);
//   return stdDev;
// }
//
// function average(data) {
//   var sum = data.reduce(function(sum, value) {
//     return sum + value;
//   }, 0);
//
//   var avg = sum / data.length;
//   return avg;
// }
//calculate the starting time and ending time with currentTime
const getStartAndEnd = (currentTime, intervalNum, intervalUnit, startTimeNum, startTimeUnit) => {
  if(intervalUnit == "minutes") {
    var left = moment(currentTime).minutes() % intervalNum;
    var endOfTime = moment(currentTime).subtract(left, intervalUnit);
    var startOfTime = moment(endOfTime).subtract(startTimeNum, startTimeUnit);
    console.log(`${moment.parseZone(startOfTime).local()} ~~ ${moment.parseZone(endOfTime).local()}`);
  } else if(intervalUnit == "hours") {
    var left = moment(currentTime).minutes();
    var endOfTime = moment(currentTime).subtract(left, "minutes");
    var startOfTime = moment(endOfTime).subtract(startTimeNum, startTimeUnit);
    console.log(`${moment.parseZone(startOfTime).local()} ~~ ${moment.parseZone(endOfTime).local()}`);
  }

  return { startOfTime, endOfTime }
};

//reduce multiple data into different interval of data
var avgIntervalValue = (data, interval, unit, startOfTime, endOfTime) => {
  var sum = 0,
    count = 0;
  var results = [];
  //set interval in 5 min
  //plus the interval time ex:1.00am + 5min = 1.05am
  var endInInterval = moment(startOfTime).add(interval, unit);
  //starting to reduce the data
  while(startOfTime <= endOfTime) {
    if(endInInterval > endOfTime) {
      break;
    }
    if(!data.length) {
      if(count > 0) //no data but still left some value in sum
      {
        results.push({
          value: (sum / count).toFixed(1),
          date: endInInterval
        });
        sum = 0;
        count = 0;
      } else { //no data and the rest of the interval 's value will set to null
        results.push({
          value: null,
          date: endInInterval
        });
      }
      startOfTime = endInInterval; //changing the end of a interval
      endInInterval = moment(endInInterval).add(interval, unit);
      //console.log("data is empty");
      continue;
    }
    //the first data.date is greater than the end of a interval
    if(data[0].date > endInInterval) {
      // when did not have this interval 's data , set to null
      if(count == 0) {
        results.push({
          value: null,
          date: endInInterval
        });
      } else { //avg all of this interval 's data.value
        results.push({
          value: (sum / count).toFixed(1),
          date: endInInterval
        });
        sum = 0;
        count = 0;
      }
      startOfTime = endInInterval; //changing the end of a interval
      endInInterval = moment(endInInterval).add(interval, unit);
    } //adding the data to this interval
    else if(data[0].date <= endInInterval) {
      sum += data[0].value;
      count += 1;
      data.splice(0, 1);
    }
  }
  //console.log("results : "+results);
  return results;
};
const findInterval = (timeInterval) => {
  var res;
  switch (timeInterval) {
    case "5m":
      res = {
        intervalNum: 5,
        intervalUnit: "minutes",
        startTimeNum: 1,
        startTimeUnit: "hours"
      };
      break;
    case "30m":
      res = {
        intervalNum: 30,
        intervalUnit: "minutes",
        startTimeNum: 6,
        startTimeUnit: "hours"
      };
      break;
    case "1h":
      res = {
        intervalNum: 1,
        intervalUnit: "hours",
        startTimeNum: 12,
        startTimeUnit: "hours"
      };
      break;
  }
  return res;
}
module.exports = { getStartAndEnd, avgIntervalValue, findInterval };