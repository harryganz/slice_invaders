(function() {
'use strict';
// Html Elements
var $gameWindow = $();
var $startBtn = $();
var $gameOver = $();

// Game Elements
var $ship = $();

// Game loop info
var gameLoopId = 0;
var timeout = 333; //ms
var counter = 1;
var addSliceInterval = 2000; //ms

function Movable(x, y, width, height){
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 1;
  this.height = height || 1;
}

Movable.prototype.move = function(x, y){
  this.x = x || 0;
  this.y = y || 0;
};

Movable.prototype.setWidth = function(width){
  this.width = width;
};

Movable.prototype.setHeight = function(height){
  this.height = height;
};

function Ship(x, y, width, height){
  Movable.call(this, x, y, width, height);
}

Ship.prototype = Object.create(Movable.prototype);

function Slice(x, y, width, height){
  Movable.call(this, x, y, width, height);
}

Slice.prototype = Object.create(Movable.prototype);

function Projectile(x, y, width, height) {
  Movable.call(this, x, y, width, height);
}

Projectile.prototype = Object.create(Movable.prototype);

// Game object
var game = {
  ship: {},
  slices: [],
  projectiles: [],
  width: 0,
  height: 0,
  start: function(width, height){
    // Reset anything from previous game
    this.slices = [];
    this.projectiles = [];
    // Set the height and width
    this.width = width || 100;
    this.height = height || 100;
    // Create a new ship and add make it this.ship
    // Place in center of board
    this.ship = new Ship(this.width/2, 0, 20, 20);
    // Add 1 slice to slices array
    this.addSlice();
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
  },
  addSlice: function(){
    // Create a new slice and place it in a random
    // place at the top of the game
    var slice = new Slice(0, 0, 20, 20);
    var randomX = Math.random()*(this.width - slice.width);
    slice.move(randomX, (this.height - slice.height));
    // Push it to the slices array
    this.slices.push(slice);
  },
  moveSlices: function(dy){
    // Move all the slices down by dy
    this.slices.forEach(function(el){
      var yAfterMove = el.y+dy;
      if(yAfterMove <= 0){
        el.move(el.x, 0);
      } else {
        el.move(el.x, el.y+dy);
      }
    });
  },
  addProjectile: function(){
    // Create a new projectile in the same location as the ship
    var newProjectile = new Projectile(0, 0, 5, 5);
    newProjectile.x = this.ship.x + this.ship.width/2 - newProjectile.width/2;
    newProjectile.y = this.ship.height;
    this.projectiles.push(newProjectile);
  },
  moveProjectiles: function(dy){
    // Move all the projectiles up by dy TODO refactor to other function
    var height = this.height;
    this.projectiles.forEach(function(el, index, array){
      var yAfterMove = el.y+dy;
      if(yAfterMove >= height){ // Remove projectiles that have
        // gone too far remove it
        array.splice(index, 1);
      } else {
        el.move(el.x, el.y+dy);
      }
    });
  },
  isOver: function(){
    return this.slices.some(function(el){
      return el.y <= 0;
    });
  }
};

// Initialize board
function initializeBoard(){
  // Hide the start button
  $startBtn.hide();
  // Hide gameOver div
  $gameOver.hide();
  // Run the start method of the game
  game.start($gameWindow.width(), $gameWindow.height());
  // Create the ship object
  $ship = $('<div class="ship">');
  // Append the ship to the board
  $gameWindow.append($ship);
  // Draw the Ship
  drawShip(game.ship);
  // Draw slices initial position
  drawSlices(game.slices);
  // On keypress run the moveShip handler
  $(document).on('keydown', moveShip);
  // On a keypress fire projectiles
  $(document).on('keydown', fireProjectile);
  // Start the game loop id
  gameLoopId = window.setInterval(gameLoop, timeout);
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

// Draw slices from game
// Has absolute position relative to bottom left of
// game board
function drawSlices(slices){
  // Remove all current slices
  $('.slice').remove(); // TODO: refactor
  // Create new slices and add to gameWindow
  var $newSlice;
  slices.forEach(function(slice){
    $newSlice = $('<div class="slice">');
    $newSlice.
    css('width', slice.width).
    css('height', slice.height).
    css('bottom', slice.y).
    css('left', slice.x);
    $newSlice.appendTo($gameWindow);
  });
}

// Draw projectiles from game
// Has absolute position relative to the bottom left of the game
// board
function drawProjectiles(projectiles){
  // Remove all current projectiles
  $('.projectile').remove(); // TODO refactor
  // Create new projectiles and add hem to the game window
  projectiles.forEach(function(projectile){
    var $newProjectile = $('<div class="projectile">');
    $newProjectile.
    css('width', projectile.width).
    css('height', projectile.height).
    css('bottom', projectile.y).
    css('left', projectile.x);
    $newProjectile.appendTo($gameWindow);
  });
}

// On game over display game over div
function gameOver(){
  // Clear all game elements
  $ship.remove();
  $('.slice').remove();
  $('.projectile').remove();
  $startBtn.show();
  $gameOver.show();
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

// Handler for shooting projectiles
function fireProjectile(event){
  if(event.which === 87){
    game.addProjectile();
  }
}

// Animation loop
function gameLoop(){
  // Move slices and projectiles in game obj
  game.moveSlices(-10);
  game.moveProjectiles(20);
  // Redraw slices and projectiles
  drawProjectiles(game.projectiles);
  drawSlices(game.slices);
  // Add a slice once per addSliceInterval
  if(counter % Math.round(addSliceInterval/timeout) === 0){
    game.addSlice();
  }
  if(game.isOver()){
    window.clearInterval(gameLoopId);
    gameOver();
  }
  counter++;
}

$(document).ready(function(){
  console.log('Jquery and game.js Loaded');
  // Load html elements
  $gameWindow = $('#game-window');
  $startBtn = $('#start-btn');
  $gameOver = $('#game-over');
  // On click run the start handler
  $startBtn.click(startHandler);
});

}());
