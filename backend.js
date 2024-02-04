
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

function pullRandom(){
    let randomOne = Math.floor(Math.random() * deck.length);
    cardPulled = deck[randOne]
    deck.splice(randomOne, 1);
    return cardPulled
}

//cards chose to put back
function putBack(card1, card2){
    deck.push(card1, card2)
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
            if(!result){ //no one blocked the action
                players[key].coins += 2;
            }else{ //someone blocked the action
                var result2 = await isIdentityChanllenged(); //question identity
                if(result2.isChallenged){
                //guessed wrong
                    if(players[result2.target].cardOne != "Duck" && players[result2.target].cardTwo != "Duck"){
                    socket.emit("chooseCard-ask", sender);
                    var response = await chooseCard_response();
                    if(response == 1){
                        players[sender].cardOne = 'X';
                    }else if(response ==2){
                        players[sender].cardTwo = 'X';
                    }
                    }else{ //guessed right
                    socket.emit("chooseCard-ask", target)
                    var response = await chooseCard_response();
                    if(response == 1){
                        players[target].cardOne = 'X';
                    }else if(response ==2){
                        players[target].cardTwo = 'X';
                    }
                    }
                }
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
                setTimeout(() => resolve(false), 20000)
            })
        }
    
        /*isIdentityChanllenged: determine if any players challenge 
        the current player (return: boolean, )*/
        var isIdentityChanllenged = () => {
            return new Promise(function(resolve, reject) {
            socket.on('identityChallenged', (isChallenged, sender, target)=>{
                if(isChallenged){
                resolve({isChallenged, sender, target})
                }else{
                resolve(isChallenged)
                }
            })
            setTimeout(() => resolve(false), 20000)
            })
        }
  
      var chooseCard_response = () => {
        return new Promise((resolve, reject) => {
          socket.on("chooseCard-response", (response)=>{
            resolve(response)
          })
          setTimeout(()=> resolve(1), 5000)
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
                backEndPlayers[Sender].numCoins -= 7
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

        var chooseCard = (Target) => {
            return new Promise(function(resolve, reject) {
                socket.emit('chooseCard', Target)
                
                socket.on('getCard', (card) => {
                    resolve(card) //which card gets deleted
                })
                setTimeout(() => resolve(1), 20000)
            })
        }

        //swap
        socket.on("swap", async(id) => {
            newCard1 = pullRandom()
            newCard2 = pullRandom()
            
            socket.emit('chooseSwapCards', backEndPlayers[id], newCard1, newCard2)

            socket.on('3Cards', (putCard1, putCard2, keepCard) => {
                if(backEndPlayers[id].cardOne == 'X'){
                    backEndPlayers[id].cardTwo = keepCard
                }
                else{
                    backEndPlayers[id].cardOne = keepCard
                }
                putBack(putCard1, putCard2)
            })

            socket.on('4Cards', (putCard1, putCard2, keepCard1, keepCard2) => {
                backEndPlayers[id].cardOne = keepCard1
                backEndPlayers[id].cardTwo = keepCard2
                putBack(putCard1, putCard2)
            })
        })

        //steal
        socket.on("steal", async(Sender, Target) => {
            try{
                var result1 = await isChallengedByCaptain();
                var result2 = await isChallengedByAmbassador();
                console.log("InFA" + result)
                if(!result1 && !result2){ //no one blocked the action
                    backEndPlayers[Sender].numCoins += 2;
                    backEndPlayers[Target].numCoins -= 2;
                }else{ //someone blocked the action
                    var result3 = await isIdentityChanllenged(); //question identity
                    if(result3.isChallenged){
                    //guessed wrong
                        if(players[result2.target].cardOne != "Duck" && players[result2.target].cardTwo != "Duck"){
                        socket.emit("chooseCard-ask", sender);
                        var response = await chooseCard_response();
                        if(response == 1){
                            players[sender].cardOne = 'X';
                        }else if(response ==2){
                            players[sender].cardTwo = 'X';
                        }
                        }else{ //guessed right
                        socket.emit("chooseCard-ask", target)
                        var response = await chooseCard_response();
                        if(response == 1){
                            players[target].cardOne = 'X';
                        }else if(response ==2){
                            players[target].cardTwo = 'X';
                        }
                        }
                    }
                }
                console.log(players[key]);
                }catch(err){
                console.log(err)
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