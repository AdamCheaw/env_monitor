const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const jwt = require('jsonwebtoken');
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

              const token = jwt.sign(
                {
                  _id: result._id,
                },
                "secret",
                {
                  expiresIn: "1h"
                }
              );
              req.session.userID = result._id;
              console.log(result);
              console.log(token);
              return res.status(200).json({
                message: "login successful",
                token: token
              });
            }
          })
          .catch(err => {
            console.log(err);
            res.send({err:err.message});
            return;
          });
      }
      else {
        const token = jwt.sign(
          {
            _id: userID._id,
          },
          "secret",
          {
            expiresIn: "1h"
          }
        );
        req.session.userID = userID._id;
        console.log(token);
        return res.status(200).json({
          message: "login successful",
          token: token
        });
      }

    })
  //console.log("sessionID: "+req.session.id);
}
module.exports = {
  UserLogin
};
