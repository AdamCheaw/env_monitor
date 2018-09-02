var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var moment = require('moment');
const {searchSubscribeList} = require('../server/utils/search');
router.get('/', (req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
  // var doc = searchSubscribeList(req.session.views);
  // console.log(doc);
  // res.send(doc);
  searchSubscribeList(req.session.views,function(result) {
    if(result != "") {
      res.render('observe',{items:result, session:req.session.views});
    }
    else {
      res.send("nothing can be observe");
    }
    console.log(result);
  });
});

module.exports = router;
