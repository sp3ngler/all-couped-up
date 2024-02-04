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
    res.sendFile(__dirname + '/src/frontend/mainMenu.html');
  });

const playerArray = [];
let deck = ["Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa", "Duke", "Assassin", "Ambassador", "Captain", "Contessa"];
let coinSupply = 50;

function randomizeHand(PL) {
    let randomOne = Math.floor(Math.random() * deck.length);
    PL.cardOne = deck[randomOne];
    deck.splice(randomOne, 1);
    let randomTwo = Math.floor(Math.random() * deck.length);    
    PL.cardTwo = deck[randomTwo];
    deck.splice(randomTwo, 1);
}

  //helper function for foreignAid function
  var isChallengedByDuck = () => {
    return new Promise(function(resolve, reject) {
        socket.on("challengedByDuck", (isChallenged) => {

          resolve(isChallenged) //which player is duck
        })
        setTimeout(() => resolve(isChallenged), 20000)
    })
  }

  //helper function for tax function
  let taxIsChallenged = () => {
    return new Promise(function(resolve, reject) {
        socket.on("challengeTax", (isChallenged) => {
            resolve(isChallenged);
        });
        setTimeout(() => resolve(false), 5000);
    });
  };

  let assassinateIsChallenged = () => {
    return new Primise(function(resolve, reject) {
        socket.on("challengeAssassinate", (isChallenged) => {
            resolve(isChallenged);
        });
        setTimeout(() => resolve(false), 5000);
    })
  }
  
  function loseCard(id, card) {
    backEndPlayers[id].numCards--;
    if (backEndPlayers[id].numCards == 1) {
        socket.to(backEndPlayers[id]).emit("disconnect")
    }
    else {
        if (card == backEndPlayers[id].cardOne) {
            backEndPlayers[id].cardOne = "X";
        }
        else if (card == backEndPlayers[id].cardTwo) {
            backEndPlayers[id].cardTargeted = "X";
        }
    }
  }

  function loseAllCards(id) {
    backEndPlayers[id].cardOne = "X";
    backEndPlayers[id].cardTwo = "X";
    if (backEndPlayers[id].numCards == 1) {
        backEndPlayers[id].numCards--;
    }
    else {
        backEndPlayers[id].numCards -= 2;
    }
  }

  const backEndPlayers = {};
  let capacity  = 0;
  if(capacity <= 4){
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected')
        io.emit('updatePlayers', backEndPlayers)
    
        //socket.on('initGame', (username) => {
            backEndPlayers[socket.id] = {
                    id: socket.id,
                    numCards: 2,
                    numCoins: 2,
                    cardOne: "",
                    cardTwo: "",
                    username: ""
            }

            randomizeHand(backEndPlayers[socket.id])
            capacity++;
        //})

            //"income" 
            socket.on('income', (id) => {
                backEndPlayers[id].numCoins;
            })
            
            //"foreign aid"
            socket.on("foreignAid", async(key) => {
                console.log("foreignAid triggered")
                try{
                    var result = await isChallengedByDuck();
                    console.log("InFA" + result)
                    if(!result){
                        backEndPlayers[key].coins += 2;
                    }
                    console.log(backEndPlayers[key]);
                }catch(err){
                    console.log(err)
                }
            })

            //"tax"
            socket.on("tax", async(key) => {
                console.log("TAX")
                try {
                    let result = await taxIsChallenged();
                    if (result) {
                        socket.to(target).emit("taxChallengeAttempt")
                        console.log("Tax Challenged");
                    }
                    else {
                        coinSupply-=3;
                        backEndPlayers[key].numCoins += 3;
                        console.log("3 coins taxed");
                    }
                }
                catch (error) {
                    console.log(error)
                }
            })
            
            // Come back from taxChallengeAttempt
            socket.on("taxChallengeResponse", async(key) => {
                console.log("TAX CHALLENGE")
                if (backEndPlayers[key].cardOne == "Duke" || backEndPlayers[key].cardTwo == "Duke") {
                    coinSupply-=3;
                    backEndPlayers[key].numCoins += 3;
                    console.log("3 coins taxed");
                }
                else {
                    console.log("Blocked tax");
                }
            })

            // "assassinate"
            socket.on("assassinate", async(user, target) => {
                console.log("ASSASSINATE")
                try {
                    let result = await assassinateIsChallenged();
                    if (result) {
                        console.log("Assassinate Challenged");
                        socket.to(target).emit("assassinationChallenge", {
                            user: user,
                            target: target,
                        })
                    }
                    else {
                        socket.to(target).emit("assassinationAttempt", {
                            user: user,
                            target: target,
                        });
                    }
                }
                catch (error) {
                    console.log(error);
                }
            });

            // Come back from assassinationAttempt
            socket.on("assassinationAttemptResponse", async (response) => {
                const { user, target, targetCard } = response;
                deck.push(targetCard)
                loseCard(backEndPlayers[target], targetCard);
                backEndPlayers[target].numCards--;
                coinSupply += 3;
                backEndPlayers[user].numCoins -= 3;
            });


            // Come back from assassinationChallengeAttempt (Contessa Challenged only)
            socket.on("assassinationChallengeContessaResponse", async(response) => {
                const { user, target } = response;
                // Challenges Contessa
                if (backEndPlayers[target].cardOne == "Contessa" || backEndPlayers[target].cardTwo == "Contessa") {
                    coinSupply += 3;
                    backEndPlayers[user].numCoins -= 3;
                }
                // Target has no contessa
                else {
                    loseAllCards(target);
                    coinSupply += 3;
                    backEndPlayers[user].numCoins -= 3;
                }
            })

            // Come back from assassinationChallengeAttempt (Assassin Challenged only)
            socket.on("assassinationChallengeAssassinResponse", async(response) => {
                const { user, target, targetCard } = response;
                // Challenges Assassin
                coinSupply += 3;
                backEndPlayers[user].numCoins -= 3;
                if (backEndPlayers[user].cardOne == "Assassin" || backEndPlayers[user].cardTwo == "Assassin") {
                    backEndPlayers[target].loseCard(targetCard);
                }
                // User has no assassin
                else {
                    console.log("No assassin");
                }
            })

            // Come back from assassinationChallengeAttempt (Assassin and Contessa Challenged)
            socket.on("assassinationChallengeAssassinContessaResponse", async(response) => {
                const { user, target } = response;
                if (backEndPlayers[user].cardOne == "Assassin" || backEndPlayers[user].cardTwo == "Assassin") {
                    // Has no contessa and has assassin
                    if (backEndPlayers[target].cardOne == "Contessa" || backEndPlayers[target].cardTwo == "Contessa") {
                        loseAllCards(target);
                        coinSupply += 3;
                        backEndPlayers[user].numCoins -= 3;
                    }
                    // Has contessa and has assassin
                    coinSupply += 3;
                    backEndPlayers[user].numCoins -= 3;
                }
                else {
                    // Has no assassins
                    console.log("Assassin lost");
                }
            })

            // Come back from assassinationChallenge
            socket.on("assassinationChallengeResult", async (response) => {
                const { user, target, targetCard, } = result;
            })
    
        // socket.on('disconnect', (reason) => {
        //     console.log(reason)
        //     delete backEndPlayers[socket.id]
        //     io.emit('updatePlayers', backEndPlayers)
        // })
        console.log(coinSupply)
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
