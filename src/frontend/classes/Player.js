class Player {
    constructor(id, username) {
      this.id = id;
      this.cardCounter = 2;
      this.numCoins = 2;
      this.cardOne = "";
      this.cardTwo = "";
      this.username = username;
    }

    setCardOne(dead){
      this.cardOne = "X"
    }

    setCardTwo(dead){
      this.cardTwo = "X"
    }
  }