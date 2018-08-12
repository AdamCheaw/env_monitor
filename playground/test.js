var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
// var io = require('socket.io');
// var socket = io.connect('http://localhost:3000/news');
var io = require('socket.io-client');


router.get('/', (req, res, next) => {
  var socket = io('http://localhost:3000');
  socket.emit('c', ()=> {});
  res.status(200).json({
    message:"emit event"
  });
});

module.exports = router;
