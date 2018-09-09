var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var moment = require('moment');
const {searchSubList_withSubName} = require('../controllers/SubscribeList');
// const {userOnConnect} = require('../controllers/user');

router.get('/', (req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
  // userOnConnect();
  // var doc = searchSubscribeList(req.session.views);
  // console.log(doc);
  // res.send(doc);
  searchSubList_withSubName(req.session.views,function(result) {
    if(result != "" || result !== undefined) {
      res.render('observe',{items:result, session:req.session.views});
    }
    else {
      res.render('observe',{items:result, session:req.session.views});
    }
    console.log(result);
  });
});

module.exports = router;
