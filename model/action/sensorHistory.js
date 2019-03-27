var sensorHistory = require('../schema/sensorHistory');
var express = require('express');
var ObjectId = require('mongodb').ObjectID;

var searchSensorHistory = (sensorID,startOfTime,endOfTime) => {
  var start = new Date(startOfTime).toISOString();
  var end = new Date(endOfTime).toISOString();
  return sensorHistory.find({
    _sensorID: ObjectId(sensorID),
    date: {
      $gte: start,
      $lte: end
    }
  }).select('name value date _sensorID').exec();
}

module.exports = { searchSensorHistory };
