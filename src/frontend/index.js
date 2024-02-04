var socket = io();
var frontendPlayers = {};

socket.on('updatePlayers', (players) => {
    for(let key in players){
        if(!(key in frontendPlayers)){
            frontendPlayers[key] = players[key];
            console.log("add a new player")
            socket.emit('income', key);
            var isChallenged = true;
            socket.emit('foreignAid', key)
            socket.emit('challengedByDuck', isChallenged)

        }
    }
})

