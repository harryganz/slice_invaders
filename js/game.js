(function() {
'use strict';
// Html Elements
var $gameWindow = $();
var $startBtn = $();
var $gameOver = $();
var $score1 = $();
var $score2 = $();

// Game Elements
var shipsArray = [];
var slicesArray = [];
var projectilesArray = [];

// Game loop info
var sliceSpeed;
var gameLoopId;
var timeout;
var counter;
var addSliceInterval;
var playerOneFireTimeout;
var playerTwoFireTimeout;


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

Projectile.prototype.player = -1;

Projectile.prototype = Object.create(Movable.prototype);

// Game object
var game = {
  ships: [],
  slices: [],
  projectiles: [],
  scores: [0,0],
  width: 0,
  height: 0,
  start: function(width, height){
    // Reset anything from previous game
    this.slices = [];
    this.projectiles = [];
    this.scores = [0,0];
    // Set the height and width
    this.width = width || 100;
    this.height = height || 100;
    // Create a new ship and add make it this.ship
    // Place in center of board
    this.ships[0] = new Ship(this.width/4, 0, 30, 40);
    this.ships[1] = new Ship(this.width*3/4, 0, 30, 40);
    // Add 1 slice to slices array
    this.addSlice();
  },
  moveShip: function(dx, index){ // Move ship at index by dx on board
    // If ship will be off the board move to edge of board
    var xAfterMove = this.ships[index].x + dx;
    if(xAfterMove <= 0){
      this.ships[index].move(0);
    } else if (xAfterMove >= (this.width - this.ships[index].width)) {
      this.ships[index].move(this.width - this.ships[index].width);
    } else {
      this.ships[index].move(xAfterMove);
    }
  },
  addSlice: function(){
    // Create a new slice and place it in a random
    // place at the top of the game
    var slice = new Slice(0, 0, 30, 30);
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
  addProjectile: function(shipIndex){
    // Create a new projectile in the same location as the ship
    var newProjectile = new Projectile(0, 0, 5, 5);
    newProjectile.x = this.ships[shipIndex].x + this.ships[shipIndex].width/2 - newProjectile.width/2;
    newProjectile.y = this.ships[shipIndex].height;
    newProjectile.player = shipIndex;
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
  removeCollided: function(){
    for(var i = 0; i < this.slices.length; i++){
      for (var j = 0; j < this.projectiles.length; j++){
        var sliceI = this.slices[i];
        var projectileJ = this.projectiles[j];
        if((projectileJ.x >= sliceI.x && projectileJ.x < (sliceI.x + sliceI.width)) &&
          projectileJ.y >= sliceI.y) {
            this.scores[projectileJ.player] += 10;
            this.slices.splice(this.slices.indexOf(sliceI), 1);
            this.projectiles.splice(this.projectiles.indexOf(projectileJ), 1);
          }
      }
    }
  },
  isOver: function(){
    return this.slices.some(function(el){
      return el.y <= 0;
    });
  }
};

// Key Press Listeners
// Code from stackoverflow: http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
var map = [];
var onkeydown, onkeyup;
onkeydown = onkeyup = function(e){
  map[e.keyCode] = e.type == 'keydown';
  if(map['65']){
    game.moveShip(-10, 0); // Move ship1 left on A
  }
  if(map['68']){
    game.moveShip(10, 0); // Move ship1 right on D
  }
  if(map['87']){
    if(!playerOneFireTimeout) {
      game.addProjectile(0); // Fire ship1 on W
      playerOneFireTimeout = true;
      window.setTimeout(function(){
        playerOneFireTimeout = false;
      }, 333);
    }
  }
  if(map['37']){
    event.preventDefault(); // Prevent Scrolling
    game.moveShip(-10, 1); // Move ship2 left on left arrow
  }
  if(map['38']){
    event.preventDefault();
    if(!playerTwoFireTimeout) {
      game.addProjectile(1); // Fire ship2 on up arrow
      playerTwoFireTimeout = true;
      window.setTimeout(function(){
        playerTwoFireTimeout = false;
      }, 333);
    }
  }
  if(map['39']){
    event.preventDefault();
    game.moveShip(10, 1); // Move ship2 right on right arrow
  }
  // Draw ships
  drawGameObj(game.ships[0], shipsArray[0]);
  drawGameObj(game.ships[1], shipsArray[1]);
};

// Initialize board
function initializeBoard(){
  // Reset all variables
  sliceSpeed = -2; // Slice moveement per timeout
  gameLoopId = 0;
  timeout = 33; //ms
  counter = 1;
  addSliceInterval = 2000; //ms
  playerOneFireTimeout = false;
  playerTwoFireTimeout = false;

  // Hide and Show Static Elements //
  $startBtn.hide();
  // Hide gameOver div
  $gameOver.hide();
  // Show score
  $score1.show();
  $score2.show();

  // Run the start method of the game
  game.start($gameWindow.width(), $gameWindow.height());

  // Create ship DOM Elements and append to window
  var $newShip;
  for (var i = 0; i < game.ships.length; i++){
    $newShip = $('<div class="ship ship' + (i+1) +'">');
    $gameWindow.append($newShip);
    shipsArray.push($newShip);
  }
  // Show ships
  drawGameObjs(game.ships, shipsArray, 'ship');
  // Show original slice
  drawGameObjs(game.slices, slicesArray, 'slice');

  // Add keypress listeners
  map = [];
  $(document).on('keydown', onkeydown);
  $(document).on('keyup', onkeyup);

  // Start the game loop id
  gameLoopId = window.setInterval(gameLoop, timeout);
}

// Draw a single game object on DOM
// In a corresponding dom object (element)
function drawGameObj(gameObj, domObj){
  domObj.
  css('width', gameObj.width).
  css('height', gameObj.height).
  css('bottom', gameObj.y).
  css('left', gameObj.x);
}

// Function to draw multiple game elements on the DOM with class type
function drawGameObjs(gameArray, domArray, type){
  // Hide the previous Iteration
  domArray.forEach(function(el){
    el.hide();
  });
  // For each element in game array, look for a corresponding element in
  // the domArray, if it exists draw it in the new location. If not make a new
  // element and draw it there
  var nGameObj = gameArray.length;
  gameArray.forEach(function(el, index, array){
    if(domArray[index]){
      drawGameObj(el, domArray[index]);
    } else {
      var $newObj = $('<div class="' + type + '">'); // Create a new obj
      drawGameObj(el, $newObj); // Set its properties
      $newObj.appendTo($gameWindow);
      domArray.push($newObj);
    }
    // Show all elements in the domArray that are in gameArray
    domArray.slice(0, nGameObj).forEach(function(el){
      el.show();
    });
  });
}

// On game over display game over div
// And clear all game elements
function gameOver(){
  // Clear all game elements
  shipsArray.forEach(function(ship){ship.remove();});
  shipsArray = [];
  slicesArray.forEach(function(slice){slice.remove();});
  slicesArray = [];
  projectilesArray.forEach(function(proj){proj.remove();});
  projectilesArray = [];
  // Clear event listeners
  $(document).off('keydown', onkeydown);
  $(document).off('keyup', onkeyup);
  // Get the winner
  var winner = -1;
  if(game.scores[0] > game.scores[1]){
    winner = 'PLAYER 1 WINS!';
  } else if(game.scores[1] > game.scores[0]){
    winner = 'PLAYER 2 WINS';
  } else {
    winner = 'IT\'S A TIE!';
  }
  // Change start button to show restart game
  $startBtn.text('Restart Game');
  // Show gameOver text and start button
  $gameOver.text(winner);
  $startBtn.show();
  $gameOver.show();
}

// Animation loop
function gameLoop(){
  // Move slices and projectiles in game obj
  game.moveSlices(sliceSpeed);
  game.moveProjectiles(10);
  // Remove collided object
  game.removeCollided();
  // Redraw slices, projectiles, and ships
  drawGameObjs(game.projectiles, projectilesArray, 'projectile');
  drawGameObjs(game.slices, slicesArray, 'slice');
  // Draw score
  $score1.text('P1: ' + game.scores[0]);
  $score2.text('P2: ' + game.scores[1]);
  // Add a slice once per addSliceInterval
  if(counter % Math.round(addSliceInterval/timeout) === 0){
    game.addSlice();
    addSliceInterval *= 0.98;
  }
  // Speed up slices once every three addSliceIntervals
  if(counter % Math.round(addSliceInterval*3/timeout === 0)){
    sliceSpeed *= 1.1;
  }
  // When game is over stop animation and run gameOver
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
  $score1 = $('.score.score1');
  $score2 = $('.score.score2');
  // On click run the start handler
  $startBtn.click(function(event){
    initializeBoard();
  });
});

}());
