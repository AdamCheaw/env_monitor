const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {
  findUserID,
  createUser
} = require('../../model/action/user');

const Authentication = (req, res, next) => {
  if(!req.body.name) {
    res.status(400).json({
      message: "request is being reject"
    });
    return;
  }
  console.log(`POST - ${req.body.name} try to login through API`);
  findUserID(req.body.name)
    .then(userID => {
      if(!userID) {
        createUser(req.body.name)
          .then(result => {
            if(result) {

              const token = jwt.sign({
                  _id: result._id,
                  name: req.body.name
                },
                "secret", {
                  expiresIn: "1h"
                }
              );
              req.session.userID = result._id;
              console.log(result);
              console.log(token);
              return res.status(200).json({
                message: "authentication success",
                token: token
              });
            }
          })
          .catch(err => {
            console.log(err);
            res.status(406).json({
              err: err.message
            });
            return;
          });
      } else {
        const token = jwt.sign({
            _id: userID._id,
            name: req.body.name
          },
          "secret", {
            expiresIn: "1h"
          }
        );
        req.session.userID = userID._id;
        console.log(token);
        return res.status(200).json({
          message: "authentication success",
          token: token
        });
      }

    })
}

module.exports = {
  Authentication
}