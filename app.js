const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression')
const sensor = require('./routes/sensor');
const user = require('./routes/user');
const observer = require('./routes/observer');
const hbs = require('express-handlebars');
const test = require('./playground/test');
const expressValidator = require('express-validator');
const expressSession = require('express-session');
const {checkDisconnect} = require('./controllers/sensor');
const {removeExHistoryData,removeExSubscriptionLogs} = require('./controllers/schedule');
const {initialSetup} = require('./controllers/setup');


app.engine('hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: require('./server/handlebars-helpers')
  })
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(expressSession({
  key: 'user_id',
  secret: 'little cat',
  saveUninitialized: false,
  resave: false
}));
// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_id && !req.session.userID) {
        res.clearCookie('user_id');
    }
    next();
});
// middleware function to check for logged-in users

app.get("/", (req,res,next) => {
  res.redirect('/getData');
});
app.get("/logout", (req,res,next) => {
  req.session.destroy();
  res.render('login');
});
app.use("/sensors", sensor);
app.use("/getData", user);
app.use("/observe", observer);
//app.use("/test", test);
setInterval(function() {
  checkDisconnect();
}, 60000);//60000
removeExHistoryData();
removeExSubscriptionLogs();
initialSetup();
module.exports = app;
