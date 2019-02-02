const {
  mapValueToCondition,
  mapValueToCondition_withOR,
  mapValueToCondition_withAND
} = require('./mapCondition');
var filter_NotificationList = (results,currentData) => {
  var data = [];
  results.forEach(result => {
    var doc = {};
    if(result.option == "default") {
      doc = {
        _id: result._id,
        socketID : result._subscriber.socketID,
        onConnect : result._subscriber.onConnect,
        option : result.option,
        condition : result.condition,
        _sensorID: result._sensorID.map(sensor => {
          return {
            _id: sensor._id,
            name: sensor.name,
            temp: sensor.temp,
            date: sensor.date
          };
        }),
        groupType: result.groupType,
        //previousMatch: true
      };
    }
    // option = "advanced" , no grouping
    else if(result.option == "advanced" && result.groupType == null){
      let matchingResult = mapValueToCondition(result.condition,currentData.value);
      if(matchingResult.match !== result.previousMatch) {
        let statusLog
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        }
        else {
          matchingResult.matchMsg = result._sensorID[0].name + " "
            + matchingResult.matchMsg;
            statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID : result._subscriber.socketID,
          onConnect : result._subscriber.onConnect,
          option : result.option,
          condition : result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              temp: sensor.temp,
              date: sensor.date,
              onConnect:sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: {//for saving log
            title: result.title,
            logMsg: matchingResult.matchMsg,
            logStatus: statusLog,
            _subscription: result._id,
            _subscriber: result._subscriber._id
          }

        };
      }
    }
    // when result.option == "advanced"
    // need to match "all" the sensor condition
    else if(result.option == "advanced" && result.groupType == "AND") {
      let matchingResult = mapValueToCondition_withAND(
        result._sensorID,result.condition,currentData,result.previousMatch
      );
      //console.log(matchingResult);
      //compare every condition in the subscription
      if(matchingResult.match !== result.previousMatch) {
        let statusLog;
        if(!matchingResult.match) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        }
        else if(matchingResult.match){
          matchingResult.matchMsg = "All sensors" + " " + matchingResult.matchMsg;
          statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID : result._subscriber.socketID,
          onConnect : result._subscriber.onConnect,
          option : result.option,
          condition : result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              temp: sensor.temp,
              date: sensor.date,
              onConnect:sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: {//for saving log
            title: `group "${result.title}"`,
            logMsg: matchingResult.matchMsg,
            logStatus: statusLog,
            _subscription: result._id,
            _subscriber: result._subscriber._id
          }
        };
      }
    }
    //end result.option == "advanced" && result.groupType == "AND"
    // when result.option == "advanced" || groupType == "OR"
    // just need to match one sensor condition
    else if(result.option == "advanced" && result.groupType == "OR"){
      let matchingResult = mapValueToCondition_withOR(
        result._sensorID,result.condition,currentData,result.previousMatch
      );
      //console.log(matchingResult);
      //the sensor currentValue matching 's condition
      //different than previous matching 's condition
      if(matchingResult.match !== result.previousMatch) {
        let statusLog;
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        }
        else {
          statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID : result._subscriber.socketID,
          onConnect : result._subscriber.onConnect,
          option : result.option,
          condition : result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              temp: sensor.temp,
              date: sensor.date,
              onConnect:sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: {//for saving log
            title: `group "${result.title}"`,
            logMsg: matchingResult.matchMsg,
            logStatus: statusLog,
            _subscription: result._id,
            _subscriber: result._subscriber._id
          }
        };
      }
    }
    //end result.option == "advanced" && result.groupType == "OR"
    //when previousMatch is true and current condition did not matching
    //need to notification user condition is back to normal
    // if(result.previousMatch) {
    //   doc = {
    //     _id: result._id,
    //     socketID : result._subscriber.socketID,
    //     onConnect : result._subscriber.onConnect,
    //     option : result.option,
    //     condition : result.condition,
    //     _sensorID: result._sensorID.map(sensor => {
    //       return {
    //         _id: sensor._id,
    //         name: sensor.name,
    //         temp: sensor.temp,
    //         date: sensor.date,
    //         onConnect:sensor.onConnect
    //       };
    //     }),
    //     groupType: result.groupType,
    //     previousMatch: false
    //   };
    // }
    //if doc had assign notification info ,save to the data
    if(doc._id) {
      data.push(doc);
    }
  });
  // end results.forEach
  //console.log(data);
  return data;
}

module.exports = { filter_NotificationList }
