var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {
  getSubscriptionInfo,findSubscribeBefore,
  updateSubscriptionInfo,unsubscribeOne,
  updateSubList_PreviousMatchCondition,
  getSubscription_relatedSensorInfo,
  getSubCondition_bySID,subscribeMany
} = require('../../model/action/SubscribeList');
const {findUserID} = require('../../model/action/user')
const {saveSubscriptionLogs} = require('../../model/action/subscriptionLogs');
const {
  updateMultiSensor_PubCondition,searchMultiSensorPubCondition_byID
} = require('../../model/action/sensor')
const {mapToLogMsg} = require('../../server/utils/convert');
const {checkMatchCondition} = require('../../server/utils/checkMatchCondition');
const {aggregatedConditions} = require('../../server/utils/aggregatedConditions');
const {destructureSubCondition} = require('../../server/utils/manipulateData');
//function
const aggregateMultiSensor_PubCondition = async (docs) => {
  var results = [];
  for (const sensor of docs._sensorID) {
    var allConditions = [];
    var conditions = await getSubCondition_bySID(sensor._id);
    for(const doc of conditions) {//merge multiple array of object into one array
      //if at least had one default subscription
      if(Array.isArray(doc.condition) && doc.condition.length === 0){
        allConditions = [];//assign empty condition
        console.log("had default subscription");
        break;
      }
      allConditions = allConditions.concat(...doc.condition);
    }
    console.log("id - "+sensor._id);
    console.log(allConditions);
    let preConditions = [
      {type:"max",value:null},
      {type:"min",value:null}
    ];
    let afterAggCondition = aggregatedConditions(preConditions,allConditions)
    console.log(afterAggCondition);
    results.push({
      sensorID: sensor._id,
      condition: afterAggCondition
    });
  }//end for loop
  //update multiple sensor publish condition in DB
  updateMultiSensor_PubCondition(results);
}

//export module
var SubscribeMany = async (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /subscribeMany`);
  findSubscribeBefore(req.session.views,req.body.subscription)//find exist subscription
    .then(exist => {
      if(exist && exist.length)
      {
        console.log("exist : "+exist);
        throw new Error("sensor already subscribe before");
      }
      findUserID(req.session.views)//find user ID
        .then(userID => {
          if(!userID)
          {
            console.log("did not found userID");
            throw new Error("did not found userID");
          }
          //subscribe new
          return subscribeMany(req.session.views,userID,req.body.subscription);
        })
        .then(results => {
          res.json({msg:"success"});
          var docs = results.map(doc => {
            return {
              _subscription:doc._id,
              _subscriber:req.session.userID,
              title: `created a subscription`,
              logMsg: doc.groupType === null? doc.title:`group "${doc.title}"`,
              logStatus: 3
            }
          });
          // console.log();
          // console.log(docs);
          // console.log();
          //save the subscription logs
          //about user created the subscription info
          saveSubscriptionLogs(docs);
          //console.log(results);
        })
        .catch(err => {
          throw new Error(err.message);
          console.log(err);
        });
    })
    .catch(err => {
      res.status(400).json({msg:err.message});
      console.log(err);
      return;
    });
    //convert group subscription into single subscription
    var subscriptions = destructureSubCondition(req.body.subscription);
    //find all related sensor 's current publish condition
    var sensors = await searchMultiSensorPubCondition_byID(subscriptions);
    var results = [];
    //aggregate sensor publish condition according user subscriptions
    for(let i = 0;i < subscriptions.length;i++) {
      if(sensors[i].publishCondition && sensors[i].publishCondition.length){
        var condition = aggregatedConditions(
          sensors[i].publishCondition, subscriptions[i].condition
        );
      }
      else {
        let preConditions = [
          {type:"max",value:null},
          {type:"min",value:null}
        ];
        var condition = aggregatedConditions(preConditions,subscriptions[i].condition);
      }
      console.log("id - ",subscriptions[i].sensorID);
      console.log(condition);
      results.push({
        sensorID: subscriptions[i].sensorID,
        condition: condition
      });
    }
    //update multiple sensor publish condition in DB
    updateMultiSensor_PubCondition(results);
}

var Unsubscribe = async (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /unsubscribe`);
  var subscription = await getSubscriptionInfo(req.body.subscribeListID);

  unsubscribeOne(req.body.subscribeListID,(result) => {
    if(result == "success") {//response to ajax
      res.json({msg:"success"});
    }
    else {
      res.status(400).json({msg:result});
      return;
    }
  });
  var doc = { //generate delete log
    _subscription:req.body.subscribeListID,
    _subscriber:req.session.userID,
    title: `delete a subscription`,
    logMsg: subscription.groupType === null ?
            subscription.title : `group "${subscription.title}"`,
    logStatus: 4
  };
  saveSubscriptionLogs(doc);//save delete log
  //aggregate related sensor's publishCondition
  aggregateMultiSensor_PubCondition(subscription);

}
var GetSubscriptionInfo = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /getSubscriptionInfo`);
  getSubscriptionInfo(req.body._id)
    .then(doc => {
      if(doc && doc !== null && doc !== undefined) {
        res.json(doc);
      }
      else {
        res.status(400).json({msg:"nothing found"});
      }
    })
    .catch(err => {
      res.status(400).json({msg:err.message});
      console.log(err);
    });
}
var UpdateSubscriptionInfo = async (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /updateSubscriptionInfo`);
  // 1. save user update subscription info in log
  // 2. reset subscription matching flag
  // 3. if after the update , and match condition, save info in log
  // 4. aggregate related sensors publish msg condition
  updateSubscriptionInfo(req.body)//option or groupType , condition
   .then(result => {
     if(result) {
       res.json({msg:"ok!"});
     }
   })
   .catch(err => {
     res.status(400).json({msg:err.message});
     return;
   });
  try {
    var result = await getSubscription_relatedSensorInfo(req.body._id);
    var doc = { //generate update subscription log
      _subscription:req.body._id,
      _subscriber:req.session.userID,
      title: `changing a subscription `,
      logMsg: mapToLogMsg(req.body,result.title),
      logStatus: 2
    };
    saveSubscriptionLogs(doc)//save update subscription log
    // console.log();
    // console.log(matchResult);
    // console.log();
    //aggregate related sensor publish condition
    aggregateMultiSensor_PubCondition(result);
    var matchResult = checkMatchCondition (
      result._sensorID,result.option,result.groupType,result.condition
    );
    if(matchResult.match === null){//sensor disconnect or can not do matching
      return;
    }//matchCondition is differrent than previous matchCondition
    else if(matchResult.match !== result.previousMatch) {
      //update match condition status
      updateSubList_PreviousMatchCondition([req.body._id],matchResult.match);
      if(matchResult.match) {//safe
        var doc = { //generate update subscription log
          _subscription:req.body._id,
          _subscriber:req.session.userID,
          title: (result.groupType === null) ? result.title : `group "${result.title}"`,
          logMsg: matchResult.matchMsg,
          logStatus: 0
        };
      }
      else {//match condition
        var doc = { //generate update subscription log
          _subscription:req.body._id,
          _subscriber:req.session.userID,
          title: (result.groupType === null) ? result.title : `group "${result.title}"`,
          logMsg: "back to normal",
          logStatus: 1
        };
      }
      //saving sensor status info after update subscription
      saveSubscriptionLogs(doc);
    }
  }
  catch (err) {
    console.log(err);
  }
}


module.exports = {
  SubscribeMany,
  GetSubscriptionInfo,
  UpdateSubscriptionInfo,
  Unsubscribe
}
