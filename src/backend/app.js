/*
THE ENTRY POINT or main application file for a Node.js project.

In a Node.js application, app.js typically includes the following responsibilities:

1.Server Setup: Creating an HTTP server using the built-in http or express module to handle incoming requests and send responses.
2.Routing: Defining routes to handle different HTTP methods (GET, POST, etc.) and specifying the corresponding logic to execute when those routes are accessed.
3.Middleware Configuration: Applying middleware functions to handle tasks such as request parsing, authentication, logging, etc. Middleware functions are executed before the final request handler.
4.Database Connections: Establishing connections to databases or other external services that the application interacts with.
5.Configuration: Setting up and configuring the application, including environment variables, constants, and other settings.
*/

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

const players = [];
let deck = ["Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa"];
let actions = [""];
function randomizeHand(PL) {
    let randomOne = Math.floor(Math.random() * cards.length);
    PL.cardOne = deck[randomOne];
    deck.splice(randomOne, 1);
    let randomTwo = Math.floor(Math.random() * cards.length);    
    PL.cardTwo = deck[randomTwo];
    deck.splice(randomOne, 1);
}

function checkActions(PL) {
    if (PL.cardOne == "Assassin")
}

io.on('connection', (socket) => {
    console.log('a user connected')

    if (players.length <= 4) {
        let player = new Player(socket.id);
        randomizeHand(player);
        players.push(player);
    }

    io.emit('updatePlayers', players)


    socket.on('turn start', ())

    socket.on('turn end', ())

    socket.on('disconnect', (reason) => {
        console.log(reason)
        delete players[socket.id]
        io.emit('updatePlayers', players)
    })

    console.log(players)

    socket.on('')

});


server.listen(port, () => {
    console.log(`Coup listening on port ${port}`);
});

console.log('server did not load')