var UserData = require('../model/user');
var io = require('socket.io-client');
var mongoose = require('mongoose');
var express = require('express');

//store user connect info (onConnect:true)
var userOnConnect = (name, socketID) => {
  UserData.findOne({name:name}, (err,doc) => {
    if(err) {
      console.log(err);
      return;
    }
    if(doc) {//user had connect before
      if(doc.onConnect == true) {
        var socket = io('http://localhost:3000');
        //io.sockets.connected[socket.id].disconnect();
        socket.emit('disconnectSocket', {socketID:doc.socketID})
        doc.socketID = socketID;
        doc.save();
        console.log('db user: deleted old connected socket and store new socket');
      }
      else {
        doc.onConnect = true;
        doc.socketID = socketID;
        doc.save();
        console.log('db user: store new socket');
      }
    }
    else {//user not connect socket before
      var item = {
        name: name,
        onConnect: true,
        socketID: socketID
      };
      var data = new UserData(item);
      data.save()
      .catch(err => {
        console.log(err);
      });
    }
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
module.exports = {userOnConnect,userDisconnect,searchUser_withName};
