const {
  generateSensorData,
  generateNotification,
  generateSensorDisconnectData
} = require('./utils/generate');
// const {subscribe,unsubscribe} = require('./utils/subscribe_event');
const {userOnConnect,userDisconnect} = require('../model/action/user');
const {searchSensorByID} = require('../model/action/sensor');
const {
  searchSubscribeList_withSensorID,
  notificationList,
  updateSubList_PreviousMatchCondition,
  findAllSubscriber_bySensorID
} = require('../model/action/SubscribeList');
const {saveSubscriptionLogs} = require('../model/action/subscriptionLogs');
var webSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('auth',(data) => {
      console.log('SOCKET - '+data.name+' have connected, socket id: '+socket.id);
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

      console.log("SOCKET - disconnect old socket "+data.socketID);
      if (io.sockets.connected[data.socketID]) {
        io.sockets.connected[data.socketID].disconnect();
      }
    });

    //sensor notification
    socket.on('update', (SensorData) => {
      console.log(`SOCKET - listening a updated event from sensor ${SensorData._id}` );
      console.log("-----------------------------------------------------------");
      notificationList(SensorData,(results) => {
        if(results!= "") {
          var updateMatch = [];
          var updateNotMatch = [];
          var subscriptionLogs = [];
          //starting send notifications
          for(let i = 0;i < results.length;i++) {
            if (io.sockets.connected[results[i].socketID]) {
              io.to(results[i].socketID)
                .emit('notification', generateNotification(results[i]));
              console.log("socket: emit update msg to socket " + results[i].socketID);
            }
            //changing current matching condition to subscription.previousMatch
            if(results[i].previousMatch && results[i].previousMatch !== undefined) {
              updateMatch.push(results[i]._id);
            }
            else if(!results[i].previousMatch && results[i].previousMatch !== undefined){
              updateNotMatch.push(results[i]._id);
            }

            if(results[i].subscriptionLog) {
              // console.log("-------------LogMsg---------------");
              // console.log(results[i].subscriptionLog);
              // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
              subscriptionLogs.push(results[i].subscriptionLog);
            }
          }//end sending notifications

          if (updateMatch || updateNotMatch) {
            //update the current notification value to the subscribeList previousValue after emit to user
            updateSubList_PreviousMatchCondition(updateMatch,true);
            updateSubList_PreviousMatchCondition(updateNotMatch,false);
          }

          if(subscriptionLogs && subscriptionLogs.length){
            //save the multiple subscription 's logs
            saveSubscriptionLogs(subscriptionLogs);
          }

        }
      })

      //io.emit('notification',generateData(data));
    });
    socket.on('sensor connect', async (data) => {
      console.log(`SOCKET - listening Sensor ${data._id} onConnect`);
      //save sensor onConnect logs with related subscriber
      var subscriptionLogs = [];//save sensor onConnect to logs
      // find related subscriptions
      let subscriptions = await findAllSubscriber_bySensorID(data._id);
      subscriptions.forEach(subscription => {
        let socketID = subscription._subscriber.socketID;
        let onConnect = subscription._subscriber.onConnect;
        //subscriber is connect with socket
        //emit sensor onConnect msg to subscriber
        if(onConnect && io.sockets.connected[socketID]) {
          io.to(socketID).emit('sensor connect',generateNotification(subscription));
        }
        subscriptionLogs.push({
          title: (subscription.groupType === null) ?
           subscription.title:`group "${subscription.title}"`,
          logMsg: data.name + " is connect",
          logStatus: 1,
          _subscription: subscription._id,
          _subscriber: subscription._subscriber
        });
      });//end subscriptions.forEach
      if(subscriptionLogs && subscriptionLogs.length) {
        saveSubscriptionLogs(subscriptionLogs);//save sensor onConnect logs
      }
    })
    socket.on('sensor disconnect',(data) => {
      console.log("SOCKET - listening Sensor Disconnect event "+data.disconnect_SID);
      //multiple sensor id,because will have multiple sensor disconnect in a min
      var subscriptionLogs = [];
      data.disconnect_SID.forEach(sensorID => {
        searchSensorByID(sensorID)//find sensor infomation
          .then(sensor => {
            console.log();
            console.log(sensor);
            console.log();
            findAllSubscriber_bySensorID(sensorID)
              .then(docs => {
                //emit disconnect event to all subscriber
                docs.forEach(doc => {
                  let socketID = doc._subscriber.socketID;
                  let onConnect = doc._subscriber.onConnect;
                  //subscriber is connect with socket
                  if(onConnect && io.sockets.connected[socketID]) {
                    io.to(socketID).emit('sensor disconnect',
                      generateSensorDisconnectData(doc,sensorID)
                    );
                  }
                  subscriptionLogs.push({
                    title: (doc.groupType === null) ? doc.title:`group "${doc.title}"`,
                    logMsg: sensor[0].name + " is disconnect",
                    logStatus: -1,
                    _subscription: doc._id,
                    _subscriber: doc._subscriber
                  });
                });
                if(subscriptionLogs && subscriptionLogs.length) {
                  console.log(subscriptionLogs);
                  saveSubscriptionLogs(subscriptionLogs);//save sensor disconnect logs
                }
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(err => {
            console.log(err);
          });
      });//end disconnect sensors loops

    })
    socket.on('disconnect', () => {
      console.log('SOCKET - User was disconnected');
      userDisconnect(socket.id);
    });
  });
}
module.exports = webSocket;
