const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const webSocket = require('./server/socket')(io);
// const webSocket = require('./server/socket')(io);

server.listen(port,() => {
  console.log('server is start on port 3000');
});
