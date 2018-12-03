const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const {generateSensorData,generateNotification} = require('./server/utils/generate');
const {subscribe,unsubscribe} = require('./server/utils/subscribe_event');
const {userOnConnect,userDisconnect} = require('./controllers/user');
const {
  searchSubscribeList_withSensorID,
  notificationList,
  updateSubList_PreviousMatchCondition } = require('./controllers/SubscribeList');
io.on('connection', (socket) => {
  socket.on('auth',(data) => {
    console.log(data.name+' have connected, socket id: '+socket.id);
    userOnConnect(data.name,socket.id)
      .then(result => {
        if(result) {
          console.log(result);
        }
      })
      .catch(err => {
        console.log(err);
      })
  });
  //console.log('a user connected, id: '+socket.id);
  //testing
  socket.on('c', (data) => {
    console.log(data.message);
  });
  //when user open new observe page
  socket.on('disconnectSocket', (data) => {

    console.log("disconnect old socket "+data.socketID);
    if (io.sockets.connected[data.socketID]) {
      io.sockets.connected[data.socketID].disconnect();
    }
  });

  //sensor notification
  socket.on('update', (SensorData) => {
    console.log(`socket: listening a updated event from sensor ${SensorData._id}` );
    console.log("-----------------------------------------------------------");
    notificationList(SensorData._id,Number(SensorData.temp),(results) => {
      if(results!= "") {
        var updateMatch = [];
        var updateNotMatch = [];
        for(let i = 0;i < results.length;i++) {
          if (io.sockets.connected[results[i].socketID]) {
            io.to(results[i].socketID).emit('notification', generateNotification(results[i]));
            console.log("socket: emit update msg to socket " + results[i].socketID);
            if(results[i].previousMatch) {
              updateMatch.push(results[i]._id);
            }
            else {
              updateNotMatch.push(results[i]._id);
            }//save the matching flag when notification success
          }
        }
        if (updateMatch || updateNotMatch) {
          //update the current notification value to the subscribeList previousValue after emit to user
          updateSubList_PreviousMatchCondition(updateMatch,true);
          updateSubList_PreviousMatchCondition(updateNotMatch,false);
        }

      }
    })

    //io.emit('notification',generateData(data));
  });
  socket.on('sensor disconnect',(data) => {
    console.log("socket : listening Sensor Disconnect event "+data.disconnect_SID);
    //multiple sensor id,because will have multiple sensor disconnect in 30sc
    for(var i = 0;i < data.disconnect_SID.length;i++) {
      //notification multiple user with this sensor disconnect
      searchSubscribeList_withSensorID(data.disconnect_SID[i], (socketID,disconnectSensorID) => {
        if(socketID!= "") {
          for(var j = 0;j < socketID.length;j++) {
            if (io.sockets.connected[socketID[j]]) {
              io.to(socketID[j]).emit('sensor disconnect', {disconnectSensorID:disconnectSensorID});
              console.log("socket: emit sensor "+disconnectSensorID+" disconnect msg to socket " + socketID[j]);
            }
          }
        }
        else {
          console.log("socket: no user subscribe this sensor or subscriber not online");
        }
      });
    }
  })
  socket.on('disconnect', () => {
    console.log('User was disconnected');
    userDisconnect(socket.id);
  });
});
server.listen(port,() => {
  console.log('server is start on port 3000');
});
