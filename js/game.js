(function() {
'use strict';
// Html Elements
var $gameWindow;
var $startBtn;

// Game Elements
var $ship;

function Ship(x, y, width, height){
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 1;
  this.height = height || 1;
  this.move = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
  };
  this.setWidth = function(width){
    this.width = width || 1;
  };
  this.setHeight = function(height){
    this.height = height || 1;
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
    this.ship = new Ship(this.width/2, 0, 20, 20);
  },
  moveShip: function(dx){ // Move ship by dx on board
    // If ship will be off the board move to edge of board
    var xAfterMove = this.ship.x + dx;
    if(xAfterMove < 0){
      this.ship.move(0);
    } else if (xAfterMove > (this.width - this.ship.width)) {
      this.ship.move(this.width - this.ship.width);
    } else {
      this.ship.move(xAfterMove);
    }
  }
};

// Initialize board
function initializeBoard(){
  // Hide the start button
  $startBtn.hide();
  // Run the start method of the game
  game.start($gameWindow.width(), $gameWindow.height());
  // Create the ship object
  $ship = $('<div class="ship"></div>');
  // Append the ship to the board
  $gameWindow.append($ship);
  // Draw the ship
  drawShip(game.ship);
  // On keypress run the moveShip handler
  $(document).on('keydown', moveShip);
}

// Draw the ship
// Has an absolute position relative to the game board
function drawShip(ship){
  $ship.
  css('width', ship.width).
  css('height', ship.height).
  css('bottom', 0).
  css('left', ship.x);
}

// Draw the game and all its objects
function drawGame(game) {
  drawShip(game.ship);
}

// Handler for the start button
function startHandler(event){
  initializeBoard();
}

// Handler for pressing a and d key
function moveShip(event){
   // a 65 d 68
   // When a is pressed move ship left by 10 pixels
   if(event.which === 65){
     game.moveShip(-30);
   }
   // When d is pressed move ship right 10 pixel
   if(event.which === 68){
     game.moveShip(30);
   }

   // Draw ship again
   drawShip(game.ship);
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
