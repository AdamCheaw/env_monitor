var UserData = require('../schema/user');
var io = require('socket.io-client');
var mongoose = require('mongoose');
var express = require('express');

//store user connect info (onConnect:true)
var userOnConnect = (name, socketID) => {
  return new Promise((resolve, reject) => {
    //search user doc get to knew about onConnect status
    UserData.findOne({name:name}, (err,doc) => {
      if(err) {
        console.log(err);
        reject(err);
      }
      if(doc) {//user had connect before
        if(doc.onConnect == true) {
          var socket = io('http://localhost:3000');
          //io.sockets.connected[socket.id].disconnect();
          socket.emit('disconnectSocket', {socketID:doc.socketID})
          doc.socketID = socketID;
          resolve(doc.save());
        }
        else {
          doc.onConnect = true;
          doc.socketID = socketID;
          console.log('db user: store new socket');
          resolve(doc.save());
        }
      }
    });
  });
};

//store user disconnect info (onConnect:false)
var userDisconnect = (socketID) => {
  UserData.findOne({socketID:socketID}, (err,doc) => {
    if(err) {
      console.log(err);
      return;
    }
    if(doc) {
      doc.socketID = "";
      doc.onConnect = false;
      doc.save()
      .catch(err => {
        console.log(err);
      });
    }
  });
};


//find user's id
var searchUser_withName = (name,callback) => {
  UserData.findOne({name:name}, (err, doc) => {
    if(err) {
      console.log(err);
      return;
    }
    if(doc) {
      callback(doc._id);
      //console.log("searchUser_withName "+name+": "+doc._id);
      return;
    }
    else {
      var item = {
        name: name,
        onConnect: false,
        socketID: ""
      };
      var data = new UserData(item);
      data.save()
      .catch(err => {
        console.log(err);
      });
      callback(data._id);
      console.log("insert new user "+name+": "+doc._id);
      return;
    }
  })
}
//find user's id with name ,no callback style
var findUserID = (name) => {
  return UserData.findOne({name:name}).select("_id").exec();
}
var createUser = (name) => {
  var doc = {
    name:name,
    onConnect: false,
    socketID: ""
  };
  var data = new UserData(doc);
  return data.save();
}
module.exports = {
  userOnConnect,
  userDisconnect,
  searchUser_withName,
  findUserID,
  createUser,
};
