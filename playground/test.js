var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');

router.get('/', (req, res, next) => {
  res.render('test/test');
});
router.post('/form', (req, res, next) => {
  console.log("from ajax : "+req.body.data);
  if(req.body.data != "nothing") {
    res.json({data:req.body.data});
    console.log(req.session.views);
  }
  else {
    res.json({data:"nothing"});
  }

});

module.exports = router;
//const {searchSubscribeList_withSensorID} = require('../controllers/SubscribeList');
// var myObject = {
//     message: 'Hello World!',
//     name: 'test',
//     data:[
//           { _id: '5b6a72fe8f5dd04d4eadeb78',
//             date: '2018 Aug 8th 12:35:28 pm',
//             name: 'sensor1',
//             temp: '31'
//           }
//     ]
// };
// searchSubscribeList_withSensorID('5b8264ef8f83e53b726fdeda', (result) =>{
//   if(result!= "") {
//     console.log("result: " + result);
//   }
//   else {
//     console.log("nothing");
//   }
//
// })
