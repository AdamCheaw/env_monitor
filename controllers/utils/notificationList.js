const {
  mapValueToCondition,
  mapValueToCondition_withOR,
  mapValueToCondition_withAND
} = require('./mapCondition');
var filter_NotificationList = (results,currentValue) => {
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
        previousMatch: true
      };
    }
    // option = "advanced" , no grouping
    else if(result.option == "advanced" && result.groupType == null){
      let matchingResult = mapValueToCondition(result.condition,currentValue);
      if(matchingResult.match !== result.previousMatch) {
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
        }
        else {
          matchingResult.matchMsg = result._sensorID[0].name + " "
            + matchingResult.matchMsg;
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
          logMsg: matchingResult.matchMsg
        };
      }

    }
    // when result.option == "advanced"
    // need to match "all" the sensor condition
    else if(result.option == "advanced" && result.groupType == "AND") {
      let matchingResult = mapValueToCondition_withOR(
        result._sensorID,result.condition,currentValue,result.previousMatch
      );
      console.log(matchingResult);
      //compare every condition in the subscription
      for(let i = 0;i < result.condition.length;i++) {
        var type = result.condition[i].type;
        if(result.condition[i].value) {
          var conditionValue = result.condition[i].value;
        }
        else if(result.condition[i].minValue && result.condition[i].maxValue) {
          var conditionValue = {
            minValue : result.condition[i].minValue,
            maxValue : result.condition[i].maxValue,
          }
        }
        //console.log(result.condition[i]);
        if(matchingResult.match !== result.previousMatch) {
          if(matchingResult.matchMsg === null) {
            matchingResult.matchMsg = "back to normal";
          }
        }
        if(!match) {
          break;
        }
      }
      if(match) {
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
          logMsg: matchingResult.matchMsg
        };
      }

    }
    //end result.option == "advanced" && result.groupType == "AND"
    // when result.option == "advanced" || groupType == "OR"
    // just need to match one sensor condition
    else if(result.option == "advanced" && result.groupType == "OR"){
      let matchingResult = mapValueToCondition_withOR(
        result._sensorID,result.condition,currentValue,result.previousMatch
      );
      console.log(matchingResult);
      //the sensor currentValue matching 's condition
      //different than previous matching 's condition
      if(matchingResult.match !== result.previousMatch) {
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
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
          logMsg: matchingResult.matchMsg
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
