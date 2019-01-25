var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var moment = require('moment');
const {
  searchSubList_withSubName,getSubscriptionInfo,
  updateSubscriptionInfo,unsubscribeOne
} = require('../../controllers/SubscribeList');

var ObserverPage = (req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
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
var Unsubscribe = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /unsubscribe`);
  unsubscribeOne(req.body.subscribeListID,(result) => {
    if(result == "success") {//response to ajax
      res.json({msg:"success"});
    }
    else {
      res.status(400).json({msg:result});
    }
  })
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
var UpdateSubscriptionInfo = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /updateSubscriptionInfo`);
  updateSubscriptionInfo(req.body)
   .then(result => {
     if(result) {
       res.json({msg:"ok!"});
     }
   })
   .catch(err => {
     res.status(400).json({msg:err.message});
   });
}
module.exports = {
  ObserverPage,
  GetSubscriptionInfo,
  UpdateSubscriptionInfo,
  Unsubscribe,
}
