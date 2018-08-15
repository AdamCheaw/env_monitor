const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const {generateData} = require('./server/utils/generate');
io.on('connection', (socket) => {
  console.log('a user connected');
  //testing
  socket.on('c', (data) => {
    console.log(data.message);
  });
  socket.on('update', (data) => {
    console.log(`listening a updated event from ${data._id}` );
    io.emit('notification',generateData(data));
  });
  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});
server.listen(port,() => {
  console.log('server is start on port 3000');
});
