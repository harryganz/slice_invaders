(function() {
// 'use strict';
// Html Elements
var $gameWindow;
var $startBtn;

function Ship(x, y, width){
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 1;
  this.move = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
  };
  this.setWidth = function(width){
    this.width = width || 1;
  };
}

// Game object
var game = {
  ship: {},
  width: 0,
  height: 0,
  start: function(width, height){
    // Set the height and width
    this.width = width || 100;
    this.height = height || 100;
    // Create a new ship and add make it this.ship
    // Place in center of board
    this.ship = new Ship(this.width/2, 0);
  },
  moveShip: function(dx){ // Move ship by dx on board
    // If ship will be off the board move to edge of board
    var xAfterMove = this.ship.x + dx;
    if(xAfterMove < 0){
      this.ship.move(0);
    } else if (xAfterMove > this.width) {
      this.ship.move(this.width);
    } else {
      this.ship.move(xAfterMove);
    }
  }
};

function startHandler(event){
  // Hide the start button
  $startBtn.hide();
  // Run the start method of the game
  game.start();
}

$(document).ready(function(){
  console.log('Jquery and game.js Loaded');
  // Load html elements
  $gameWindow = $('#game-window');
  $startBtn = $('#start-btn');
  // On click run the start handler
  $startBtn.click(startHandler);
});

}());
