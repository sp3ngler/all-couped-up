
const express = require('express');
const app = express();

//socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 3000;

// app.use(express.static('public'));
app.use(express.static('src'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/frontend/tmp.html');
  });

const players = {}

io.on('connection', (socket) => {
    console.log('a user connected');
    players[socket.id] = {
        x: 100,
        y: 100
    }

    console.log(players)
});

server.listen(port, () => {
    console.log(`Coup listening on port ${port}`);
});

console.log('server did not load')