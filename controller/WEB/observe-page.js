var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;
const {searchSubList_withSubName} = require('../../model/action/SubscribeList');
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
module.exports = {
  ObserverPage
};
