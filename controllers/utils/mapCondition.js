var destructureCondition = (condition) => {

};
// check a single sensor's currentValue matching condition ,
// advanced = true , groupType = null
var mapValueToCondition = (condition,currentValue) => {
  let match = false;//if nothing match it will be false
  let matchMsg = null;
  for(let i = 0;i < condition.length;i++) {
    var type = condition[i].type;
    //if match condition will be true and break loop
    if(type == "max" && (currentValue > condition[i].value)) {
      match = true;
      matchMsg = `is greater than ${condition[i].value}`;
      break;
    }
    else if(type == "min" &&(currentValue < condition[i].value )) {
      match = true;
      matchMsg = `is lower than ${condition[i].value}`;
      break;
    }
    else if( type == "precision" ) {
      match = true;
      break;
    }
    else if( type == "equal" && (currentValue == condition[i].value)) {
      match = true;
      matchMsg = `is equal to ${condition[i].value}`;
      break;
    }
    else if(type == "between" &&
      (
        (currentValue > condition[i].minValue ) &&
        (currentValue < condition[i].maxValue)
      )) {
      match = true;
      matchMsg = `is between ${condition[i].minValue} and ${condition[i].maxValue}`;
      break;
    }
  }
  let matchingResult = { match,matchMsg };
  return matchingResult;
}
//groupType = 'OR'
//matching multiple sensor ,if AT LEAST there is ONE sensor matching condition
//will return true
var mapValueToCondition_withOR =
  (sensors,condition,currentData,previousMatch) => {
  let matchingResult;
  //var match = false;
  //previous did not match ,so just need match current sensor's value
  if(!previousMatch){
    matchingResult = mapValueToCondition(condition,currentData.value);
    if(matchingResult.match){
      matchingResult.matchMsg = currentData.sensorName + " " + matchingResult.matchMsg;
    }
  }
  else {
    for(let i = 0;i < sensors.length;i++) {
      matchingResult = null;
      if(!sensors[i].onConnect){
        matchingResult = {
          notOnConnect: true
        };
        break;
      }
      else {
        matchingResult = mapValueToCondition(condition,sensors[i].temp);
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
  (sensors,condition,currentData,previousMatch) => {
  let matchingResult;
  // previous is match ,
  // so just need to know current sensor's matching condition
  if(previousMatch) {
    matchingResult = mapValueToCondition(condition,currentData.value);
  }
  else {
    for(let i = 0;i < sensors.length;i++) {
      matchingResult = null;
      if(!sensors[i].onConnect){
        matchingResult = {
          notOnConnect: true
        };
        break;
      }
      else {
        matchingResult = mapValueToCondition(condition,sensors[i].temp);
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

module.exports = {
  mapValueToCondition,
  mapValueToCondition_withOR,
  mapValueToCondition_withAND
}
