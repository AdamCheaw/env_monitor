var generate_NotificationList = (results,currentValue) => {
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
    // when result.option == "advanced"
    // need to match "all" the sensor condition
    else if(result.option == "advanced" && result.groupType == "AND") {
      var match = true;//for determine match or not
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
        //compare every sensor 's matching condition
        //if got a sensor did not match , break the loop
        for(let j = 0;j < result._sensorID.length;j++) {
          var thisSensor = result._sensorID[j];
          //if sensor no on Connect , break the loop
          // console.log(result._sensorID[j]);
          if(!thisSensor.onConnect) {
            match = false;
            //console.log("match");
            break;
          }
          if( type == "max" && (Number(thisSensor.temp) < conditionValue) ) {
            match = false;
            break;
          }
          else if( type == "min" && (Number(thisSensor.temp) > conditionValue) ) {
            match = false;
            break;
          }
          else if( type == "precision" ) {
            match = false;
            break;
          }
          else if( type == "equal" && (Number(thisSensor.temp) != conditionValue )) {
            match = false;
            break;
          }
          else if(
            type == "between" &&
            ((Number(thisSensor.temp) < conditionValue.minValue &&
              Number(thisSensor.temp) > conditionValue.maxValfalse)
            )
          ) {
            match = false;
            break;
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
          previousMatch: true
        };
      }

    }
    // when result.option == "advanced"
    // just need to match one sensor condition
    else if(result.option == "advanced" && (result.groupType == "OR" || result.groupType == null )){
      var match = false;//for determine match or not
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
        //when find the match , break out the loop
        if(
          type == "max" &&
          (currentValue > conditionValue ||
            (result.previousValue!== null && result.previousValue > conditionValue)
          ) ) {
          match = true;
          break;
        }
        else if(
          type == "min" &&
          (currentValue < conditionValue ||
            (result.previousValue!== null && result.previousValue < conditionValue)
          ) ) {
          match = true;

          break;
        }
        else if( type == "precision" ) {
          match = true;
          break;
        }
        else if( type == "equal" && (currentValue == conditionValue || result.previousValue == conditionValue)) {
          match = true;
          break;
        }
        else if(
          type == "between" &&
          ((currentValue > conditionValue.minValue &&
            currentValue < conditionValue.maxValue) || (result.previousValue !== null &&
            (result.previousValue > conditionValue.minValue &&
              result.previousValue < conditionValue.maxValue))
          )
        ) {
          match = true;
          break;
        }
      }
      //when the sensor currentValue matching the condition
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
          previousMatch: true
        };
      }
    }
    //when previousMatch is true and current condition did not matching
    //need to notification user condition is back to normal
    if(result.previousMatch) {
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
        previousMatch: false
      };
  }
    if(doc._id) {
      data.push(doc);
    }
  });
  //console.log(data);
  return data;
}

module.exports = { generate_NotificationList }
