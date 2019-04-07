//*****************function*****************//
// check a single sensor's currentValue matching condition ,
// advanced = true , groupType = null
var mapValueToCondition = (condition, currentValue) => {
  let match = false; //if nothing match it will be false
  let matchMsg = null;
  for(let i = 0; i < condition.length; i++) {
    var type = condition[i].type;
    //if match condition will be true and break loop
    if(type == "greater" && (currentValue > condition[i].value)) {
      match = true;
      matchMsg = `is greater than ${condition[i].value}`;
      break;
    } else if(type == "lower" && (currentValue < condition[i].value)) {
      match = true;
      matchMsg = `is lower than ${condition[i].value}`;
      break;
    } else if(type == "precision") {
      match = true;
      break;
    } else if(type == "equal" && (currentValue == condition[i].value)) {
      match = true;
      matchMsg = `is equal to ${condition[i].value}`;
      break;
    } else if(type == "between" &&
      (
        (currentValue > condition[i].minValue) &&
        (currentValue < condition[i].maxValue)
      )) {
      match = true;
      matchMsg = `is between ${condition[i].minValue} and ${condition[i].maxValue}`;
      break;
    }
  }
  let matchingResult = {
    match,
    matchMsg
  };
  return matchingResult;
}
//groupType = 'OR'
//matching multiple sensor ,if AT LEAST there is ONE sensor matching condition
//will return true
var mapValueToCondition_withOR =
  (sensors, condition, currentData, previousMatch) => {
    let matchingResult;
    //var match = false;
    //previous did not match ,so just need match current sensor's value
    if(!previousMatch) {
      matchingResult = mapValueToCondition(condition, currentData.value);
      if(matchingResult.match) {
        matchingResult.matchMsg = currentData.sensorName + " " + matchingResult.matchMsg;
      }
    } else {
      for(let i = 0; i < sensors.length; i++) {
        matchingResult = null;
        if(!sensors[i].onConnect) {
          matchingResult = {
            notOnConnect: true
          };
          break;
        } else {
          matchingResult = mapValueToCondition(condition, sensors[i].value);
          //console.log(`check sensor ${sensors[i].name} : ${matchingResult.match}`);
        }
        //if at least there is one sensor matching condition ,
        //not need to check other sensor's value
        if(matchingResult.match) {
          //console.log(`check sensor ${sensors[i].name} : ${matchingResult.match}`);
          matchingResult.matchMsg = sensors[i].name + " " + matchingResult.matchMsg;
          break;
        }
      }
    }
    return matchingResult;
  }
//groupType = 'AND'
//matching multiple sensor ,if ALL sensor matching condition
//will return true
var mapValueToCondition_withAND =
  (sensors, condition, currentData, previousMatch) => {
    let matchingResult;
    // previous is match ,
    // so just need to know current sensor's matching condition
    if(previousMatch) {
      matchingResult = mapValueToCondition(condition, currentData.value);
    } else {
      for(let i = 0; i < sensors.length; i++) {
        matchingResult = null;
        if(!sensors[i].onConnect) {
          matchingResult = {
            notOnConnect: true
          };
          break;
        } else {
          matchingResult = mapValueToCondition(condition, sensors[i].value);
        }
        //console.log("in mapping: "+matchingResult);
        //if at least there is one sensor DID NOT matching condition ,
        //not need to check other sensor's value
        if(!matchingResult.match) {
          break;
        }
      }
    }
    return matchingResult;
  }

//***********export**********//
const generateNotificationList = (results, currentData) => {
  var data = [];
  //for each related subscription
  results.forEach(result => {
    var doc = {};
    if(result.option == "default") {
      doc = {
        _id: result._id,
        socketID: result._subscriber.socketID,
        onConnect: result._subscriber.onConnect,
        option: result.option,
        condition: result.condition,
        _sensorID: result._sensorID.map(sensor => {
          return {
            _id: sensor._id,
            name: sensor.name,
            value: sensor.value,
            date: sensor.date,
            onConnect: sensor.onConnect
          };
        }),
        groupType: result.groupType,
        //previousMatch: true
      };
    }
    // option = "advanced" , no grouping
    else if(result.option == "advanced" && result.groupType == null) {
      let matchingResult = mapValueToCondition(result.condition, currentData.value);
      // current matching condition result different than-
      // previous  matching condition result
      if(matchingResult.match !== result.previousMatch) {
        let statusLog
        //generate log msg
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        } else {
          matchingResult.matchMsg = result._sensorID[0].name + " " +
            matchingResult.matchMsg;
          statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID: result._subscriber.socketID,
          onConnect: result._subscriber.onConnect,
          option: result.option,
          condition: result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              value: sensor.value,
              date: sensor.date,
              onConnect: sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: { //for saving log
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
        result._sensorID, result.condition, currentData, result.previousMatch
      );
      //console.log(matchingResult);
      //compare every condition in the subscription
      if(matchingResult.notOnConnect !== undefined) {
        return;
      } else if(matchingResult.match !== result.previousMatch) {
        let statusLog;
        if(!matchingResult.match) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        } else if(matchingResult.match) {
          matchingResult.matchMsg = "All sensor is match condition";
          statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID: result._subscriber.socketID,
          onConnect: result._subscriber.onConnect,
          option: result.option,
          condition: result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              value: sensor.value,
              date: sensor.date,
              onConnect: sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: { //for saving log
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
    else if(result.option == "advanced" && result.groupType == "OR") {
      let matchingResult = mapValueToCondition_withOR(
        result._sensorID, result.condition, currentData, result.previousMatch
      );
      //console.log(matchingResult);
      //the sensor currentValue matching 's condition
      //different than previous matching 's condition
      if(matchingResult.notOnConnect !== undefined) {
        console.log("sensor not onConnect");
        return;
      } else if(matchingResult.match !== result.previousMatch) {
        let statusLog;
        if(matchingResult.matchMsg === null) {
          matchingResult.matchMsg = "back to normal";
          statusLog = 1;
        } else {
          statusLog = 0;
        }
        doc = {
          _id: result._id,
          socketID: result._subscriber.socketID,
          onConnect: result._subscriber.onConnect,
          option: result.option,
          condition: result.condition,
          _sensorID: result._sensorID.map(sensor => {
            return {
              _id: sensor._id,
              name: sensor.name,
              value: sensor.value,
              date: sensor.date,
              onConnect: sensor.onConnect
            };
          }),
          groupType: result.groupType,
          previousMatch: matchingResult.match, //true or false
          subscriptionLog: { //for saving log
            title: `group "${result.title}"`,
            logMsg: matchingResult.matchMsg,
            logStatus: statusLog,
            _subscription: result._id,
            _subscriber: result._subscriber._id
          }
        };
      }
    }
    //push notification data by each subscription need to be inform
    if(doc._id) {
      data.push(doc);
    }
  });
  // end results.forEach
  //console.log(data);
  return data;
}

module.exports = {
  generateNotificationList
}