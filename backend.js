
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

const playerArray = [];
let deck = ["Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa"];
let actions = [""];
function randomizeHand(PL) {
    let randomOne = Math.floor(Math.random() * deck.length);
    PL.cardOne = deck[randomOne];
    deck.splice(randomOne, 1);
    let randomTwo = Math.floor(Math.random() * deck.length);    
    PL.cardTwo = deck[randomTwo];
    deck.splice(randomTwo, 1);
}

  //helper function for foreignAid function
function isChallengedByDuck() {
    return new Promise((resolve, reject) => {
        let isChallenged = false;
        io.on("challengedByDuck", (socket) => {
          isChallenged = true;
          resolve(socket, isChallenged) //which player is duck
        })
        setTimeout(() => resolve(isChallenged), 20000)
    })
  }

  const backEndPlayers = {}

  const capacity = 0
  if(capacity <= 4){
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected')
    
        io.emit('updatePlayers', backEndPlayers)
    
        //socket.on('initGame', (username) => {
            backEndPlayers[socket.id] = {
                    id: socket.id,
                    numCoins: 2,
                    cardOne: "",
                    cardTwo: "",
                    username: ""
            }

            randomizeHand(backEndPlayers[socket.id])
        //})

            //"income" 
            socket.on('income', (id) => {
                backEndPlayers[id].numCoins++;
            })
            
            //"foreign aid"
            socket.on("foreignAid", async(socket) => {
            try{
                var result = await isChallengedByDuck();
                if(!result.isChallenged){
                    backEndPlayers[socket.id].numCoins += 2;
            }
            }catch(err){
                console.log("something went wrong")
            }
            })
    
        // socket.on('disconnect', (reason) => {
        //     console.log(reason)
        //     delete backEndPlayers[socket.id]
        //     io.emit('updatePlayers', backEndPlayers)
        // })
        console.log(backEndPlayers)
    });
  }
//   socket.on('disconnect', (reason) => {
//     console.log(reason)
//     delete backEndPlayers[socket.id]
//     io.emit('updatePlayers', backEndPlayers)
// })



server.listen(port, () => {
    console.log(`Coup listening on port ${port}`);
});

console.log('server did not load')