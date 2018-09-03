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
var observer = require('./routes/observer');
var hbs = require('express-handlebars');
var test = require('./playground/test');
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var {checkDisconnect} = require('./controllers/sensor');

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(expressSession({secret: 'little cat', saveUninitialized: false, resave: false}));

app.use("/sensors", sensor);
app.use("/getData", user);
app.use("/observe", observer);

setInterval(function() {
  checkDisconnect(function(result) {
    if((result == ""||result === undefined))
    {
      console.log("no sensor disconnect");
    }
    else if (result){
      console.log("checkDisconnect: "+result);
    }
  });
}, 60000);

//testing use
//app.use("/test", test);
module.exports = app;
