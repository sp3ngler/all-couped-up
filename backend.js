
const express = require('express');
const app = express();

//socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});

const port = 3000;

// app.use(express.static('public'));
app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/frontend/tmp.html');
  });

const backEndPlayers = {}

const capacity = 0
io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected')

    io.emit('updatePlayers', backEndPlayers)

    socket.on('initGame', (username) => {
        console.log(username)
        backEndPlayers[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            username
        }
    })

    socket.on('disconnect', (reason) => {
        console.log(reason)
        delete backEndPlayers[socket.id]
        io.emit('updatePlayers', backEndPlayers)
    })

    console.log(backEndPlayers)
});



server.listen(port, () => {
    console.log(`Coup listening on port ${port}`);
});

console.log('server did not load')