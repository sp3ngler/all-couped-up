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
const path = require('path');

/*wrapping express inside a http server 
so we can use the express functionality*/
const http = require('http')
const server = http.createServer(app)
/*socket.io set up */
const { Server } = require('socket.io')
const io = new Server(server) 
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.static('src'));

// Route definition
app.get('/', (req, res) => {
  res.sendFile('/Users/mac/Desktop/hopperhack/all-couped-up/src/frontend/mainMenu.html');
});


var players = {}
var deck = ["Duck", "Assassin", "Ambassador", 
              "Captain", "Contessa", "Duck", 
              "Assassin", "Ambassador", "Captain", 
              "Contessa", "Duck", "Assassin", "Ambassador", 
              "Captain", "Contessa"];
function randomizeHand(PL) {
    let randomOne = Math.floor(Math.random() * deck.length);
    PL.cardOne = deck[randomOne];
    deck.splice(randomOne, 1);
    let randomTwo = Math.floor(Math.random() * deck.length);    
    PL.cardTwo = deck[randomTwo];
    deck.splice(randomTwo, 1);
}

//receive connection from frontend 
io.on('connection', (socket) => {
    console.log('a user has connected')
    if(!(socket.id in players)){
      
      console.log('update player')
      players[socket.id] =  {
        id: socket.id,
        coins: 2,
        cardOne: "",
        cardTwo: ""
      }
      randomizeHand(players[socket.id]);
      socket.emit("updatePlayers", players);
    }

    //income
    socket.on('income', (key) => {
      console.log("income triggered")
      players[key].coins++;
      console.log(players[key]);
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
    the current player (return: boolean)*/
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


})

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

console.log('server is loaded')

