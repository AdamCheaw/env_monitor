var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
// var io = require('socket.io');
// var socket = io.connect('http://localhost:3000/news');
var io = require('socket.io-client');
var generateData = (data) => {
  return {
    message: data.data[0],
    name: data.name,
  };
};
var myObject = {
    message: 'Hello World!',
    name: 'test',
    data:[
          { _id: '5b6a72fe8f5dd04d4eadeb78',
            date: '2018 Aug 8th 12:35:28 pm',
            name: 'sensor1',
            temp: '31'
          }
    ]
};
router.get('/', (req, res, next) => {
  var socket = io('http://localhost:3000');
  socket.emit('c', generateData(myObject));
  res.status(200).json({
    message:"emit event"
  });
});

module.exports = router;
