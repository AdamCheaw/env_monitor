var mapValueWithCondition = (condition,currentValue) => {
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


var checkMatchCondition = (sensors,option,groupType,condition)  => {
  if(option == "default") {
    return false;
  }
  else if(option == "advanced" && groupType == null){
    if(!sensors[0].onConnect) {
      return null
    }
    else {
      let matchResult = mapValueWithCondition(condition,sensor[0].temp);
      matchResult.matcgMsg = sensors[0].name + " " + matchResult.matcgMsg;
      return matchResult;
    }
  }
  else if(option == "advanced" && groupType == "OR"){
    for(let i = 0;i < sensors.length;i++) {//check all sensors
      let matchNum = 0;
      var matchMsg;
      //if a single sensor match condition return false
      if(!sensors[i].onConnect) {//at least a sensor not connect return null
        return null;
        break;
      }
      let matchResult = mapValueWithCondition(condition,sensors[i].temp);
      if(matchResult.match) {//if true match number + 1
        matchNum += 1;
      }
    }//end sensors loop
    if(matchNum > 0) {//at least 1 sensor match condition return true
      let matchResult = {
        match : true,
        matchMsg : "sensors is match condition"
      };
      return matchingResult;
    }
    else {
      return {
        match : false,
        matchMsg : null
      };
    }
  }
  else if(option == "advanced" && groupType == "AND"){
    for(let i = 0;i < sensors.length;i++) {//check all sensors
      let matchNum = 0;
      //if a single sensor match condition return false
      if(!sensors[i].onConnect) {//at least a sensor not connect return null
        return null;
        break;
      }
      let matchResult = mapValueWithCondition(condition,sensors[i].temp);
      if(matchResult.match) {//if true match number + 1
        matchNum += 1;
      }
    }//end sensors loop
    if(matchNum === sensors.length) {//all sensor match condition return true
      let matchResult = {
        match : true,
        matchMsg : "all sensors is match condition"
      };
      return matchingResult;
    }
    else {
      return {
        match : false,
        matchMsg : null
      };
    }
  }
  console.log("can't check matching condition");
  return null;
}

module.exports = {
  checkMatchCondition
};
