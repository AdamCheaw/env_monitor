const express = require('express');
const app = express();
const fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sensor = require('./routes/sensor');
var user = require('./routes/user');

// const productRoutes = require('./api/routes/products');
// const orderRoutes = require('./api/routes/orders');
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/sensors", sensor);
app.use("/getData", user);

// app.get('/socketIO', function(req, res){
//   res.sendFile(__dirname + '/public/socket.html');
// });
module.exports = app;
