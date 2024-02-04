
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

let backEndPlayers = {
    "Adam": {
        id: "Adam",
        cardCounter: 2,
        numCoins: 10,
        cardOne: "Yo",
        cardTwo: "Bye",
        username: ""
    }
}


  var capacity = 0
  if(capacity <= 4){
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected')
    
        io.emit('updatePlayers', backEndPlayers)
    
        // socket.on('setUsername', (username) => {
            backEndPlayers[socket.id] = {
                    id: socket.id,
                    cardCounter: 2,
                    numCoins: 2,
                    cardOne: "",
                    cardTwo: "",
                    username: ""
            }

            randomizeHand(backEndPlayers[socket.id])
            capacity++
        //})

            //"income" 
            socket.on('income', (id) => {
                backEndPlayers[id].numCoins++;
            })
            
            //foreign aid
            socket.on("foreignAid", async(key) => {
                console.log("foreignAid triggered")
                try{
                var result = await isChallengedByDuck();
                console.log("InFA" + result)
                if(!result){
                    players[key].coins += 2;
                }
                console.log(players[key]);
                }catch(err){
                console.log(err)
                }
            })
  
            //helper function for foreignAid function
            var isChallengedByDuck = () => {
                return new Promise(function(resolve, reject) {
                    socket.on("challengedByDuck", (isChallenged) => {
        
                    resolve(isChallenged) //which player is duck
                    })
                    setTimeout(() => resolve(isChallenged), 20000)
                })
            }

            //"coup"
            socket.on("coup", async(Sender, Target) => {
                console.log("In CODE COUP RN")
                if(backEndPlayers[Sender].numCoins < 7)
                {
                    socket.emit('not enough')
                }   
                else{
                    //backEndPlayers[Sender].numCoins -= 7
                if(backEndPlayers[Target].cardCounter == 1){
                    backEndPlayers[Target].cardCounter--;
                    delete backEndPlayers[Target]
                    
                }
                else if(backEndPlayers[Target].cardCounter == 2){
                    try{
                        console.log("In Try Ctrach")
                        var result = await chooseCard(Target);
                        console.log("await: " + result)
                        if(result == 1 && backEndPlayers[Target].cardOne != 'X'){
                            backEndPlayers[Target].cardOne = 'X'
                            backEndPlayers[Target].cardCounter--;
                        }
                        else{
                            backEndPlayers[Target].cardTwo = 'X'
                            backEndPlayers[Target].cardCounter--;
                        }
                    }catch(err){
                        console.log(err)
                    }
                    }
                }
            })

            // function del(key){
            //     if(key in backEndPlayers){
            //         backEndPlayers.delete(key);
            //         return true;
            //     }
            //     return false;
            // }

            var chooseCard = (Target) => {
                return new Promise(function(resolve, reject) {
                    socket.emit('chooseCard', Target)
                    
                    socket.on('getCard', (card) => {
                        resolve(card) //which card gets deleted
                    })
                    setTimeout(() => resolve(1), 20000)
                })
            }
    
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