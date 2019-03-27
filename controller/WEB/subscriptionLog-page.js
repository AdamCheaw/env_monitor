var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {
  searchSubLogs_byUserID,
  countTotalSubLogs_byUserID,
  searchSubLogs_sortByDate,
  searchSubLogs_sortBySub,
  saveSubscriptionLogs
} = require('../../model/action/subscriptionLogs');
const {getSubscriptions_bySubscriber} = require('../../model/action/SubscribeList');
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
module.exports = {
  ViewLogsPage
};
