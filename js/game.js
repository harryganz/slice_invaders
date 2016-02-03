(function() {
'use strict';
// Html Elements
var $gameWindow;
var $startBtn;

function Ship(x){
  this.x = x || 0;
  this.move = function(x){
    this.x = x;
  };
}

// Game object
var game = {
  ship: {},
  grid: [],
  start: function(){
    // Create 11 element grid array
    this.grid = new Array(11);
    this.grid.fill(null);
    // Create a new ship and add make it this.ship
    this.ship = new Ship();
    // Place ship on grid at center position
    this.moveShip(5);
  },
  moveShip: function(dx){
    // If ship will go beyond edge of grid
    // do nothing
    // otherwise move the ship to the new location
    var xAfterMove = this.ship.x + dx;
    if(xAfterMove < 0 || xAfterMove > (this.grid.length-1)){
      return ;
    } else {
      // Remove ship from previous position
      this.grid.splice(this.ship.x, 1);
      // Update ships posistion
      this.ship.move(xAfterMove);
      // Put ship in new grid position
      this.grid.splice(this.ship.x, 0, this.ship);
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
