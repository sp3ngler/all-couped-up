const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'white')
const players = {}

socket.on('updatePlayers', (backendPlayers) =>{
  for (const id in backendPlayers){
    const backendPlayer = backendPlayers[id]
    //socket.emit('income', id)
    socket.emit('coup', id, "Adam")
    
    socket.on('chooseCard', (Target) => {
        socket.emit('getCard', 2)
    }) 

    socket.on('chooseSwapCard', (Target, card1, card2) => {
      socket.emit('put cards', card1, card2)
    })

    if (!players[id]) {
      players[id] = new Player(backendPlayer.x, backendPlayer.y, 10, 'white')
    }
  }

  
  for(const id in players) {
    if (!backendPlayers[id]){
      delete players[id]
    }
  }

  console.log(players)
})


