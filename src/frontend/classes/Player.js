class Player {
    constructor(id, username) {
      this.id = id;
      this.numCoins = 2;
      this.cardOne = "";
      this.cardTwo = "";
      this.username = username;
    }

    addCoin(){
      this.numCoins++;
    }
  }