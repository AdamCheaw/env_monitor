const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const {generateData} = require('./server/utils/generate');
const {subscribe,unsubscribe} = require('./server/utils/subscribe_event');
const {userOnConnect,userDisconnect} = require('./controllers/user');
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
  // //sensor notification
  // socket.on('update', (data) => {
  //   console.log(`listening a updated event from ${data._id}` );
  //   io.emit('notification',generateData(data));
  // });
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
