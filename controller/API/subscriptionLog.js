var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {
  searchSubLogs_byUserID,
  countTotalSubLogs_byUserID,
  searchSubLogs_sortByDate,
  searchSubLogs_sortBySub,
  saveSubscriptionLogs
} = require('../../model/action/subscriptionLogs');
var GetSubscriptionLogs = async (req,res,next) => {
  try {
    var skip = (req.body.page - 1) * 15;
    if(req.body.sort == "date") {
      var results = await searchSubLogs_sortByDate(
        req.session.userID,skip,15,req.body.start,req.body.end
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.userData._id),
        date: {
          $gte: req.body.start,
          $lte: req.body.end
        }
      });
    }
    else if(req.body.sort == "subscription") {
      var results = await searchSubLogs_sortBySub(
        req.userData._id,skip,15,req.body.option
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.userData._id),
        _subscription:ObjectId(req.body.option)
      });
    }
    else {
      var results = await searchSubLogs_byUserID(
        req.userData._id,skip,15
      );
      var total = await countTotalSubLogs_byUserID({
        _subscriber:ObjectId(req.userData._id)
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
  GetSubscriptionLogs
};
