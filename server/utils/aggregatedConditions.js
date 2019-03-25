const aggregatedConditions = (preResults,conditions) => {
  if(Array.isArray(conditions) && conditions.length === 0)
  {//when default
    return [];//return empty condition
  }
  var results = preResults;
  conditions.sort((a,b) => {//sorting
    var A = arrangePriority(a.type);
    var B = arrangePriority(b.type);
    if(A > B){
      return 1;
    }
    if(A < B){
      return -1;
    }
    return 0;
  })
  for(let i = 0; i < conditions.length; i++) {
    var condition = convertToMaxOrMin(results,conditions[i]);
    if(condition.type == "max"){
      if(results[0].value === null){
        results[0].value = condition.value;
      }
      else {
        results[0].value = findMaxMin(results[0].value,condition.value);
      }
    }
    else if(condition.type == "min"){
      if(results[1].value === null){
        results[1].value = condition.value;
      }
      else {
        results[1].value = findMinMax(results[1].value,condition.value);
      }
    }
  }
  if((results[0].value !== null) &&
     (results[1].value !== null) &&
     (results[0].value <= results[0].value))// when max <= min
  {
    return [];//return default condition
  }
  // console.log(results);
  return results;
}
//convert condition to type max || type min according previous condition
const convertToMaxOrMin = (preCondition,condition) => {
  var result;
  if(condition.type == "max"){
    condition.value = Number(condition.value);
    result = condition;
  }
  else if(condition.type == "min"){
    condition.value = Number(condition.value);
    result = condition;
  }
  else if(condition.type == "equal") {
    condition.value = Number(condition.value);
    if(preCondition[0].value === null && preCondition[1].value === null){
      result = (condition.value > 50 ?
                {type:"max",value:condition.value - 1}:
                {type:"min",value:condition.value + 1});
    }
    else if(preCondition[0].value !== null){
      //type Max's value <= type Equal's value
      if(preCondition[0].value <= condition.value){
        //type Equal's value in the type Max's value of SCOPE
        //ex maxValue -----> equalValue ----->
        result = {type:"max",value:condition.value - 1};
      }
      else {
        result = (condition.value > 50 ?
                  {type:"max",value:condition.value - 1}:
                  {type:"min",value:condition.value + 1});
      }
    }
    else if(preCondition[1].value !== null){
      //type Min's value >= type Equal's value
      if(preCondition[1].value >= condition.value){
        //type Equal's value in the type Min's value of SCOPE
        //ex <------- equalValue <------- minValue
        result = {type:"min",value:condition.value + 1};
      }
      else {
        result = (condition.value > 50 ?
                  {type:"max",value:condition.value - 1}:
                  {type:"min",value:condition.value + 1});
      }
    }
  }
  else if(condition.type == "between") {
    condition.minValue = Number(condition.minValue);
    condition.maxValue = Number(condition.maxValue);
    if(preCondition[0].value === null && preCondition[1].value === null) {
      result = (condition.minValue > 50 ?
                   {type:"max",value:condition.minValue}:
                   {type:"min",value:condition.maxValue});
    }
    else if(preCondition[0].value !== null){//type : max
      //ex min ~ {value ~ max ------>}
      if(condition.minValue < preCondition[0].value &&
         condition.maxValue > preCondition[0].value) {
        result = {type:"max",value:condition.minValue};
      }
      //ex {value ~ min ~ max ----->} or {value = min ~ max ----->}
      else if(condition.minValue >= preCondition[0].value) {
        result = {type:"max",value:condition.minValue};
      }
      //ex  min ~ max ~ {value ----->}
      else if(condition.minValue < preCondition[0].value &&
              condition.maxValue < preCondition[0].value) {
        result = {type:"min",value:condition.maxValue};
      }
      //ex  ~ min ~ {max == value ----->}
      else if(condition.maxValue == preCondition[0].value) {
        result = {type:"max",value:condition.minValue};
      }
    }
    else if (preCondition[1].value !== null) { //type : min
      //ex {<-----min ~ value} ~ max
      if(condition.minValue < preCondition[1].value &&
         condition.maxValue > preCondition[1].value) {
        result = {type:"min",value:condition.maxValue};
      }
      //ex {<-----value} ~ min ~ max
      if(condition.minValue > preCondition[1].value &&
         condition.maxValue > preCondition[1].value
        ){
        result = {type:"max",value:condition.minValue};
      }
      //ex {<-----min ~ value} ~ max or {<----- min ~ value = max}
      else if(condition.maxValue <= preCondition[1].value) {
        result = {type:"min",value:condition.maxValue};
      }
      //ex {<-----min = value} ~ max
      else if(condition.minValue == preCondition[1].value) {
        result = {type:"min",value:condition.maxValue};
      }

    }
  }
  return result;
}
//find most lower value with type:max
const findMaxMin = (v1,v2) => {//v1 = original value,v2 = new value
  if(v1 <= v2){//original value is lower than or equal to new value
    return v1;
  }
  else {//new value is lower than original value
    return v2;
  }
}
//find most higher value with type:min
const findMinMax = (v1,v2) => {//v1 = original value,v2 = new value
  if(v1 >= v2){//original value is higher than or equal to new value
    return v1;
  }
  else {//new value is higher than original value
    return v2;
  }
}
const arrangePriority = (type) => {
  if(type == "max"){
    return 0;
  }
  else if(type == "min") {
    return 1;
  }
  else if(type == "between") {
    return 2;
  }
  else if(type == "equal") {
    return 3;
  }
}
// conditions.sort((a,b) => {//sorting
//   var A = arrangePriority(a.type);
//   var B = arrangePriority(b.type);
//   if(A > B){
//     return 1;
//   }
//   if(A < B){
//     return -1;
//   }
//   return 0;
// })
// let preConditions = [
//   {
//     type:"max",
//     value:null
//   },
//   {
//     type:"min",
//     value:null
//   }];
module.exports = {aggregatedConditions};
