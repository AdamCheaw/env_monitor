var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var mongoose = require('mongoose');
// var SubscribeList = require('../model/SubscribeList');
// var SensorData = require('../model/sensor');
// var UserData = require('../model/user');
// var SubscriptionLog = require('../model/subscriptionLogs')
// var testData = require('../model/test');
// const {searchAllSensor} = require('../controllers/sensor');
// const {findUserID} = require('../controllers/user');
// const {searchSubList_withSubName,notificationList,updateSubList_PreviousMatchCondition,findSubscribeBefore} = require('../controllers/SubscribeList');
// var ObjectId = require('mongodb').ObjectID;
// var testing = (callback) => {
//   return callback("123");
// };
//
// SubscriptionLog.aggregate( [ { $group : { _id : "$_subscription" } } ] )
//   .exec().then(results => {
//     console.log(results);
//   });

// var date = moment().hour(0).minute(0).second(0);
// console.log(date);
// date = moment(date).utc().format();
// console.log(date);
// console.log(moment(date).hour(12));
// console.log(moment(date).subtract(1,'days'));
// console.log(moment(date).hour(12).subtract(1,'days'));
const aggregateConditions = (conditions) => {
  var results = [
    {
      type:"max",
      value:null
    },
    {
      type:"min",
      value:null
    }];
  for(let i = 0; i < conditions.length; i++) {
    var condition = convertToMaxOrMin(results,conditions[i]);
    console.log("afterC");
    console.log(condition);
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
    // if(results[0].value )
  }
  console.log(results);
}
//convert condition to type max || type min according previous condition
const convertToMaxOrMin = (preCondition,condition) => {
  var result;
  if(condition.type == "max"){
    result = condition;
  }
  else if(condition.type == "min"){
    result = condition;
  }
  else if(condition.type == "equal") {
    if(preCondition[0].value === null && preCondition[1].value === null){
      result = (condition.value > 50 ?
                {type:"max",value:condition.value}:
                {type:"min",value:condition.value});
    }
    else if(preCondition[0].value !== null){
      //type Max's value <= type Equal's value
      if(preCondition[0].value <= condition.value){
        //type Equal's value in the type Max's value of SCOPE
        //ex maxValue -----> equalValue ----->
        result = {type:"max",value:condition.value};
      }
      else {
        result = (condition.value > 50 ?
                  {type:"max",value:condition.value}:
                  {type:"min",value:condition.value});
      }
    }
    else if(preCondition[1].value !== null){
      //type Min's value >= type Equal's value
      if(preCondition[1].value >= condition.value){
        //type Equal's value in the type Min's value of SCOPE
        //ex <------- equalValue <------- minValue
        result = {type:"min",value:condition.value};
      }
      else {
        result = (condition.value > 50 ?
                  {type:"max",value:condition.value}:
                  {type:"min",value:condition.value});
      }
    }
  }
  else if(condition.type == "between") {
    if(preCondition[0].value === null && preCondition[1].value === null) {
      result = (condition.minValue > 50 ?
                   {type:"max",value:condition.minValue}:
                   {type:"min",value:condition.maxValue});
    }
    else if(preCondition[0].value !== null){
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
    else if (preCondition[1].value !== null) {
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
const compareTwoCondition = (con1,con2) => {
  var result ;
  //condition1 is null ,no need to compare just assign value
  if(con1 === null) {
    if(con2.type == "max"){
      result = con2;
    }
    else if(con2.type == "min"){
      result = con2;
    }
    else if(con2.type == "equal") {
      result = (con2.value > 50 ?
                {type:"max",value:con2.value}:
                {type:"min",value:con2.value});
    }
    else if(con2.type == "between") {
      result = (con2.minValue > 50 ?
                   {type:"max",value:con2.minValue}:
                   {type:"min",value:con2.maxValue});
    }
  }
  else if(con1.type == "max"){
    if(con2.type == "max"){

    }
  }
  return result;
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
let conditions = [
  {
    type: "equal",value: 15
  },
  {
    type: "equal",value: 20
  },
  {
    type: "equal",value: 39
  },
  {
    type: "max",value: 30
  },
  {
    type: "between",
    minValue: 28,maxValue: 30
  },
  {
    type: "between",
    minValue: 15,maxValue: 30
  },
  {
    type: "between",
    minValue: 20,maxValue: 60
  }
];
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
//console.log(conditions);

aggregateConditions(conditions);




// module.exports = router;
