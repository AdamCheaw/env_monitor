var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {
  searchSubList_withSubName,getSubscriptionInfo,
  updateSubscriptionInfo,unsubscribeOne,
  updateSubList_PreviousMatchCondition,
  getSubscriptions_bySubscriber,
  getSubscription_relatedSensorInfo,
  getSubCondition_bySID
} = require('../../controllers/SubscribeList');
const {
  searchSubLogs_byUserID,
  countTotalSubLogs_byUserID,
  searchSubLogs_sortByDate,
  searchSubLogs_sortBySub,
  saveSubscriptionLogs
} = require('../../controllers/subscriptionLogs');
const {updateMultiSensor_PubCondition} = require('../../controllers/sensor')
const {mapToLogMsg} = require('../../server/utils/convert');
const {checkMatchCondition} = require('../../server/utils/checkMatchCondition');
const {aggregatedConditions} = require('../../server/utils/aggregatedConditions');
const SubscribeListData = require('../../model/SubscribeList');
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
var ObserverPage = (req, res, next) => {
  console.log(`GET - ${req.session.views} request Observe real-time Page`);
  // response current user subscribe 's sensor info
  searchSubList_withSubName(req.session.views,function(result,subInfo) {
    if(result != "" || result !== undefined) {
      res.render('observe',{items:result, session:req.session.views});
      //console.log(result);
    }
    else {
      res.render('observe',{items:result, session:req.session.views});
    }
    //console.log(result);
  });
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
  // mongoose.disconnect();
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
    //testing aggregate
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
// using async await to response viewLog page
var ViewLogsPage = async (req, res, next) => {
  console.log(`GET - ${req.session.views} request a viewLogs page`);
  try {
    let results = await searchSubLogs_byUserID(req.session.userID,0,15);
    let subscriptionLogs = results.map(doc => {
      return {
        _id: doc._id,
        title: doc.title,
        logMsg: doc.logMsg,
        logStatus:doc.logStatus,
        date: moment.parseZone(doc.date).local().format('YYYY MMM Do, h:mm:ssa'),
      };
    });
    subscriptionLogs.reverse();//reverse the logs for suitable timeline
    let total = await countTotalSubLogs_byUserID({
      _subscriber:ObjectId(req.session.userID)
    });
    let allSubscription = await getSubscriptions_bySubscriber(req.session.userID);
    //console.log(allSubscription);
    allSubscription = allSubscription.map(sub => {
      return {
         _id: sub._id,
         title: sub.title
       };
     });
    res.render('viewLog', {
      items:subscriptionLogs,
      total:total,
      session:req.session.views,
      subscriptions:JSON.stringify(allSubscription)
    });
  }
  catch (err) {
    console.log(err);
    res.send("404 not found");
  }
}
var GetSubscriptionLogs = async (req,res,next) => {
  try {
    var skip = (req.body.page - 1) * 15;
    if(req.body.sort == "date") {
      var results = await searchSubLogs_sortByDate(
        req.session.userID,skip,15,req.body.start,req.body.end
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.session.userID),
        date: {
          $gte: req.body.start,
          $lte: req.body.end
        }
      });
    }
    else if(req.body.sort == "subscription") {
      var results = await searchSubLogs_sortBySub(
        req.session.userID,skip,15,req.body.option
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.session.userID),
        _subscription:ObjectId(req.body.option)
      });
    }
    else {
      var results = await searchSubLogs_byUserID(
        req.session.userID,skip,15
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.session.userID)
      });
    }
    //var date = moment().subtract(3,"days");
    //
    let subscriptionLogs = results.map(doc => {
      return {
        _id: doc._id,
        title: doc.title,
        logMsg: doc.logMsg,
        logStatus:doc.logStatus,
        date: moment.parseZone(doc.date).local().format('YYYY MMM Do, h:mm:ssa'),
      };
    });
    subscriptionLogs.reverse();//reverse the logs for suitable timeline
    //console.log(subscriptionLogs);
    if(subscriptionLogs && subscriptionLogs !== null && subscriptionLogs !== undefined) {
      let response = { total,subscriptionLogs}
      res.json(response);
    }
    else {
      res.status(400).json({msg:"nothing found"});
    }
  }
  catch (err) {
    console.log(err);
    res.status(400).json({msg:err.message});
  }
}

module.exports = {
  ObserverPage,
  GetSubscriptionInfo,
  UpdateSubscriptionInfo,
  Unsubscribe,
  ViewLogsPage,
  GetSubscriptionLogs
}
