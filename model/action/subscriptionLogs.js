var SubscriptionLogsData = require('../schema/subscriptionLogs');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var saveSubscriptionLogs = (data) => {
  SubscriptionLogsData.insertMany(data)
    .then(() => {
      console.log("DB: insert logs success");
      console.log();
    })
    .catch(err => {
      console.log(err);
    })
}
var searchSubLogs_byUserID = (userID,skip,limit) => {
  return SubscriptionLogsData
    .find({
      _subscriber:ObjectId(userID)
    })
    .select("_id title logMsg logStatus date _subscription")
    .sort({"date":-1})
    .skip(skip)
    .limit(limit)
    // .sort({"date":1})
    // .sort({"logStatus":1})
    .exec();
}
var searchSubLogs_sortByDate = (userID,skip,limit,start,end) => {
  return SubscriptionLogsData
    .find({
      _subscriber:ObjectId(userID),
      date: {
        $gte: start,
        $lte: end
      }
    })
    .select("_id title logMsg logStatus date _subscription")
    .sort({"date":-1})
    .skip(skip)
    .limit(limit)
    .exec();
};
var searchSubLogs_sortBySub = (userID,skip,limit,subscription) => {
  return SubscriptionLogsData
    .find({
      _subscriber:ObjectId(userID),
      _subscription:ObjectId(subscription)
    })
    .select("_id title logMsg logStatus date _subscription")
    .sort({"date":-1})
    .skip(skip)
    .limit(limit)
    .exec();
};
// var searchSubLogs_WithSortingCondition = (userID,skip,limit,sortBy,date) => {
//   if (sortBy == "date") {
//     return SubscriptionLogsData
//       .find({
//         _subscriber:ObjectId(userID),
//         date: {
//           $gte: date
//         }
//       })
//       .select("_id title logMsg logStatus date _subscription")
//       .sort({"date":-1})
//       .skip(skip)
//       .limit(limit)
//       .exec();
//   }
//   else if(sortBy == "subscription") {
//     return SubscriptionLogsData
//       .find({
//         _subscriber:ObjectId(userID),
//         date: {
//           $gte: date
//         }
//       })
//       .select("_id title logMsg logStatus date _subscription")
//       .sort({"date":-1})
//       .sort({"_subscription":1})
//       .skip(skip)
//       .limit(limit)
//       // .sort({"date":1})
//       // .sort({"logStatus":1})
//       .exec();
//   }
// }
var countTotalSubLogs_byUserID = (query) => {
  return SubscriptionLogsData
    .find(query)
    .countDocuments()
    .exec();
}

module.exports = {
  saveSubscriptionLogs,
  searchSubLogs_byUserID,
  searchSubLogs_sortByDate,
  searchSubLogs_sortBySub,
  countTotalSubLogs_byUserID
};
