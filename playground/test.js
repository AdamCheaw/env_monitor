var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// var SubscribeList = require('../model/SubscribeList');
// var {aggregatedConditions} = require('../server/utils/aggregatedConditions');
// var SensorData = require('../model/sensor');
// var UserData = require('../model/user');
// var SubscriptionLog = require('../model/subscriptionLogs')
// var testData = require('../model/test');
// const {searchAllSensor} = require('../controllers/sensor');
// const {findUserID} = require('../controllers/user');
// const {searchSubList_withSubName,notificationList,updateSubList_PreviousMatchCondition,findSubscribeBefore} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;

const checkAuth = (req,res,next) => {
  try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "secret");
        console.log(`token : ${token}`);
        console.log(`decoded : ${decoded}`);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
}
router.use('/check', checkAuth, (req,res,next) => {
  console.log(req.userData);
  res.json(
    {
      msg : "received",
      userData : req.userData
    }
  );
});
router.use('/login',  (req,res,next) => {
  console.log(req.body);
  const token = jwt.sign(
    {
      name: req.body.name,
      pwd: req.body.pwd
    },
    "secret",
    {
      expiresIn: "1h"
    }
  );
  console.log(token);
  return res.status(200).json({
    message: "Auth successful",
    token: token
  });
});






 module.exports = router;
