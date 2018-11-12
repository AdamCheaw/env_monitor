var moment = require('moment');

//calculate the starting time and ending time with currentTime
var getStartAndEnd = (currentTime) => {
  var left = currentTime.minutes() % 5;
  var endOfTime = moment(currentTime).subtract(left, 'minutes');
  var startOfTime = moment(endOfTime).subtract(1, 'hours').subtract(5, "minutes");
  console.log(`${moment.parseZone(startOfTime).local()} ~~ ${moment.parseZone(endOfTime).local()}`);
  return {
    startOfTime,
    endOfTime
  }
};

//reduce multiple data into different interval of data
var avgInInterval = (data,interval,startOfTime,endOfTime) => {
  var sum = 0,count = 0;
  var results = [];
  //set interval in 5 min
  //plus the interval time ex:1.00am + 5min = 1.05am
  var endInInterval = moment(startOfTime).add(interval, 'minutes');
  //starting to reduce the data
  while(startOfTime <= endOfTime )
  {
    if(endInInterval > endOfTime)
    {
      break;
    }
    if(!data.length)
    {
      if(count > 0)//no data but still left some value in sum
      {
        results.push({
          value : (sum/count).toFixed(1),
          date : endInInterval
        });
        sum = 0;
        count = 0;
      }
      else {//no data and the rest of the interval 's value will set to null
        results.push({
          value : null,
          date : endInInterval
        });
      }
      startOfTime = endInInterval;//changing the end of a interval
      endInInterval = moment(endInInterval).add(interval, 'minutes');
      console.log("data is empty");
      continue;
    }
    //the first data.date is greater than the end of a interval
    if(data[0].date > endInInterval) {
      // when did not have this interval 's data , set to null
      if(count == 0) {
        results.push({
          value : null,
          date : endInInterval
        });
      }
      else {//avg all of this interval 's data.value
        results.push({
          value : (sum/count).toFixed(1),
          date : endInInterval
        });
        sum = 0;
        count = 0;
      }
      startOfTime = endInInterval;//changing the end of a interval
      endInInterval = moment(endInInterval).add(interval, 'minutes');
    }//adding the data to this interval
    else if(data[0].date <= endInInterval){
      sum += data[0].value;
      count += 1;
      data.splice(0,1);
    }
  }
  //console.log("results : "+results);
  return results;
};
module.exports = {getStartAndEnd , avgInInterval};
