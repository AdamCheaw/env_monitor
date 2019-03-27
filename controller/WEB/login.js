var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
const {findUserID,createUser} = require('../../model/action/user');
var UserLogin = (req, res, next) => {
  console.log(`POST - ${req.body.name} try to login`);
  //session = user name
  req.session.views = req.body.name;
  findUserID(req.body.name)
    .then(userID => {
      if(!userID)
      {
        createUser(req.body.name)
          .then(result => {
            if(result)
            {
              console.log(result);
              res.redirect('/getData');
              return;
            }
          })
          .catch(err => {
            console.log(err);
            res.send({err:err.message});
            return;
          });
      }
      else {
        req.session.userID = userID._id;
        res.redirect('/Web');
      }

    })

  console.log(req.session);
  //console.log("sessionID: "+req.session.id);
}
module.exports = {
  UserLogin
};
