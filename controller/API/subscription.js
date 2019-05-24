const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;
const {
  getSubscriptionInfo,
  findSubscribeBefore,
  updateSubscriptionInfo,
  unsubscribeOne,
  updateSubList_PreviousMatchCondition,
  getSubscription_relatedSensorInfo,
  getSubCondition_bySID,
  subscribeMany,
  getSubscriptions_bySubscriber
} = require('../../model/action/SubscribeList');
const {
  findUserID
} = require('../../model/action/user')
const {
  saveSubscriptionLogs
} = require('../../model/action/subscriptionLogs');
const {
  updateMultiSensor_PubCondition,
  searchMultiSensorPubCondition_byID
} = require('../../model/action/sensor')
const {
  mapToLogMsg
} = require('../../server/utils/convert');
const {
  checkMatchCondition
} = require('../../server/utils/checkMatchCondition');
const {
  aggregatedConditions
} = require('../../server/utils/aggregatedConditions');
const {
  destructureSubCondition
} = require('../../server/utils/manipulateData');
const subscribeEvent = require('../../server/events/subEvent');

//function
const aggregateMultiSensor_PubCondition = async (docs) => {
  var results = [];
  for(const sensor of docs._sensorID) { //for each sensor
    var allConditions = [];
    //get sensor related subscribe condition
    var conditions = await getSubCondition_bySID(sensor._id);
    //merge all differrent sturucture like object , array into one array
    for(const doc of conditions) {
      //if at least had one default subscription no need to aggregate anymore
      if(Array.isArray(doc.condition) && doc.condition.length === 0) {
        allConditions = []; //assign empty condition
        console.log("had default subscription");
        break;
      }
      allConditions = allConditions.concat(...doc.condition);
    }
    console.log("id - " + sensor._id);
    console.log(allConditions);
    let preConditions = [{
        type: "greater",
        value: null
      },
      {
        type: "lower",
        value: null
      }
    ];
    //aggregate all condition by each sensor
    let afterAggCondition = aggregatedConditions(preConditions, allConditions)
    console.log(afterAggCondition);
    results.push({
      sensorID: sensor._id,
      condition: afterAggCondition
    });
  } //end for loop
  //update multiple sensor publish condition in DB
  updateMultiSensor_PubCondition(results);
  //emit an EVENT to sensor handler file (controller/sensor.js)
  //about sensor publish condition is changing
  subscribeEvent.emit('publishConditionChange', results);
}

//export module
const GetAllSubscription = async (req, res, next) => {
  console.log(
    `POST - ${req.userData.name} request a API call to get all related subscription`
  );
  try { //get all subscription related by the subscriber
    let allSubscription = await getSubscriptions_bySubscriber(req.userData._id);
    allSubscription = allSubscription
      .map(({ _id, title, _sensorID, option, groupType, condition }) => {
        if(groupType === null) { //not a group subscription
          return {
            _id,
            title,
            _sensorID,
            option,
            condition
          };
        } else {
          return { //group subscription
            _id,
            title,
            _sensorID,
            option,
            groupType,
            condition
          };
        }
      });
    res.status(200).json(allSubscription);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message
    });
  }
}

const GetSubscription_byID = async (req, res, next) => {
  console.log(
    `POST - ${req.userData.name} request a API call to get a subscription info`
  )
}

const SubscribeMany = async (req, res, next) => {
  console.log(`POST - ${req.userData.name} request a ajax call /subscribeMany`);

  findSubscribeBefore(req.userData._id, req.body.subscription) //find exist subscription
    .then(exist => {
      if(exist && exist.length) {
        console.log("exist : " + exist);
        throw new Error("sensor already subscribe before");
      }
      //subscribe
      return subscribeMany(req.userData.name, req.userData._id, req.body.subscription);
    })
    .then(async (results) => {
      try {
        res.status(200).json({
          msg: "success"
        });
        var docs = results.map(doc => {
          return {
            _subscription: doc._id,
            _subscriber: req.userData._id,
            title: `created a subscription`,
            logMsg: doc.groupType === null ? doc.title : `group "${doc.title}"`,
            logStatus: 3
          }
        });
        // --- save the subscription logs ---
        //about user created the subscription info
        saveSubscriptionLogs(docs);
        // --- aggregated the related conditions ---
        //convert group subscription into single subscription
        var subscriptions = destructureSubCondition(req.body.subscription);
        //find all related sensor 's current publish condition
        var sensors = await searchMultiSensorPubCondition_byID(subscriptions);
        var results = [];
        //aggregate sensor publish condition according user current subscriptions
        for(let i = 0; i < subscriptions.length; i++) {
          if(sensors[i].publishCondition && sensors[i].publishCondition.length) {
            var condition = aggregatedConditions(
              sensors[i].publishCondition, subscriptions[i].condition
            );
          } else {
            let preConditions = [{
                type: "greater",
                value: null
              },
              {
                type: "lower",
                value: null
              }
            ];
            var condition = aggregatedConditions(preConditions, subscriptions[i].condition);
          }
          console.log("id - ", subscriptions[i].sensorID);
          console.log(condition);
          results.push({
            sensorID: subscriptions[i].sensorID,
            condition: condition
          });
        }
        //update multiple sensor publish condition in DB
        updateMultiSensor_PubCondition(results);
        //--- Emit an Event ---
        //emit an EVENT to sensor handler file (controller/sensor.js)
        //about sensor publish condition is changing
        subscribeEvent.emit('publishConditionChange', results);
      } catch (err) {
        console.log(err);
        return;
      }

    })
    .catch(err => {
      res.status(406).json({
        msg: err.message
      });
      console.log(err);
      return;
    });

}

const Unsubscribe = async (req, res, next) => {
  console.log(`POST - ${req.session.views||req.userData.name} request a ajax call /unsubscribe`);
  if(!req.body.subscriptionID) {
    res.status(400).json({
      msg: "request not acceptable"
    });
    return;
  }
  try {
    var subscription = await getSubscriptionInfo(req.body.subscriptionID);
    if(subscription === null || subscription === undefined) {
      throw new Error("request not acceptable");
    }
  } catch (err) {
    res.status(400).json({
      msg: err.message
    });
    return;
  }
  // data = {_id:subscribeListID}
  unsubscribeOne(req.body.subscriptionID, (result) => {
    if(result == "success") { //response to ajax
      res.json({
        msg: "success"
      });
      var doc = { //generate delete log
        _subscription: req.body.subscriptionID,
        _subscriber: req.userData._id,
        title: `delete a subscription`,
        logMsg: (subscription.groupType === null) ?
          subscription.title : `group "${subscription.title}"`,
        logStatus: 4
      };
      saveSubscriptionLogs(doc); //save delete log
      //aggregate related sensor's publishCondition
      aggregateMultiSensor_PubCondition(subscription);
    } else {
      res.status(400).json({
        msg: result
      });
      return;
    }
  });

}
const GetSubscriptionInfo = (req, res, next) => {
  console.log(`POST - ${req.session.views||req.userData.name} request a ajax call /getSubscriptionInfo`);
  getSubscriptionInfo(req.params.id)
    .then(doc => {
      if(doc && doc !== null && doc !== undefined) {
        res.status(200).json(doc);
      } else {
        res.status(400).json({
          msg: "nothing found"
        });
      }
    })
    .catch(err => {
      res.status(400).json({
        msg: "request not acceptable"
      });
      console.log(err);
    });
}
const UpdateSubscriptionInfo = async (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /updateSubscriptionInfo`);
  // 1. save user update subscription info in log
  // 2. reset subscription matching flag
  // 3. if after the update , and match condition, save info in log
  // 4. aggregate related sensors publish msg condition
  updateSubscriptionInfo(req.body)
    .then(() => {
      res.status(200).json({
        msg: "ok!"
      });
      return getSubscription_relatedSensorInfo(req.body._id);
    })
    .then(result => {
      var doc = { //generate update subscription log
        _subscription: req.body._id,
        _subscriber: req.userData._id,
        title: `changing a subscription `,
        logMsg: mapToLogMsg(req.body, result.title),
        logStatus: 2
      };
      saveSubscriptionLogs(doc) //save update subscription log
      //aggregate related sensor publish condition
      aggregateMultiSensor_PubCondition(result);
      var matchResult = checkMatchCondition(
        result._sensorID, result.option, result.groupType, result.condition
      );
      if(matchResult.match === null) { //sensor disconnect or can not do matching
        return;
      } //matchCondition is differrent than previous matchCondition
      else if(matchResult.match !== result.previousMatch) {
        //update match condition status
        updateSubList_PreviousMatchCondition([req.body._id], matchResult.match);
        if(matchResult.match) { //safe
          var doc = { //generate update subscription log
            _subscription: req.body._id,
            _subscriber: req.userData._id,
            title: (result.groupType === null) ? result.title : `group "${result.title}"`,
            logMsg: matchResult.matchMsg,
            logStatus: 0
          };
        } else { //match condition
          var doc = { //generate update subscription log
            _subscription: req.body._id,
            _subscriber: req.userData._id,
            title: (result.groupType === null) ? result.title : `group "${result.title}"`,
            logMsg: "back to normal",
            logStatus: 1
          };
        }
        //saving sensor status info after update subscription
        saveSubscriptionLogs(doc);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        msg: "request is not acceptable"
      });
    });
}
const GetSubscriptionInfoAndRelatedSensor = async (req, res, next) => {
  console.log(`GET - ${req.session.views||req.userData.name} request a ajax call /GetSubscriptionInfoAndRelatedSensor`);
  getSubscription_relatedSensorInfo(req.params.id)
    .then(result => {
      let doc = {
        option: result.option,
        condition: result.condition,
        groupType: result.groupType,
        _sensorID: result._sensorID.map(sensor => {
          return {
            name: sensor.name,
            value: (!sensor.onConnect) ? null : sensor.value,
            onConnect: sensor.onConnect
          }
        })
      }
      res.status(200).json(doc);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        msg: "request not acceptable"
      });
    })
}

module.exports = {
  SubscribeMany,
  GetSubscriptionInfo,
  UpdateSubscriptionInfo,
  Unsubscribe,
  GetAllSubscription,
  GetSubscription_byID,
  GetSubscriptionInfoAndRelatedSensor
}