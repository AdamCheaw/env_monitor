const express = require('express');
const API = express.Router();
const sensor = require('./sensor');
const subscription = require('./subscription');



// url : {...}/API/sensor
API.get('/sensor', sensor);

// url : {...}/API/subscription
API.get('/subscription', subscription);

module.exports = API;
