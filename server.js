const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const {generateSensorData} = require('./server/utils/generate');
const {subscribe,unsubscribe} = require('./server/utils/subscribe_event');
const {userOnConnect,userDisconnect} = require('./controllers/user');
const {searchSubscribeList_withSensorID} = require('./controllers/SubscribeList');
io.on('connection', (socket) => {
  socket.on('auth',(data) => {
    console.log(data.name+' have connected, socket id: '+socket.id);
    userOnConnect(data.name,socket.id);
  });
  //console.log('a user connected, id: '+socket.id);
  //testing
  socket.on('c', (data) => {
    console.log(data.message);
  });
  socket.on('disconnectSocket', (data) => {

    console.log("disconnect old socket "+data.socketID);
    if (io.sockets.connected[data.socketID]) {
      io.sockets.connected[data.socketID].disconnect();
    }
  });
  //users subscribe
  // socket.on('subscribe',(data) => {
  //   console.log(data);
  //   subscribe(socket.id,data.sensorID);
  // });
  //sensor notification
  socket.on('update', (SensorData) => {
    console.log(`socket: listening a updated event from sensor ${SensorData._id}` );
    //searching subscriber current connect to socket
    searchSubscribeList_withSensorID(SensorData._id, (socketID) =>{
      if(socketID!= "") {
        for(var i = 0;i < socketID.length;i++) {
          if (io.sockets.connected[socketID[i]]) {
            io.to(socketID[i]).emit('notification', generateSensorData(SensorData));
            console.log("socket: emit update msg to socket " + socketID[i]);
          }
        }
      }
      else {
        console.log("socket: no user subscribe this sensor or subscriber not online");
      }
    })
    //io.emit('notification',generateData(data));
  });
  socket.on('disconnect', () => {
    console.log('User was disconnected');
    userDisconnect(socket.id);
    //unsubscribe(socket.id);
  });
});
server.listen(port,() => {
  console.log('server is start on port 3000');
});

/*
unsubscribe
search SubscribeList with socket.id and remove user_list with the socket.id
*/
