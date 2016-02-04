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

// Game loop info
var gameLoopId = 0;
var timeout = 100; //ms
var counter = 1;
var addSliceInterval = 3000; //ms

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
    this.ships[0] = new Ship(this.width/4, 0, 20, 20);
    this.ships[1] = new Ship(this.width*3/4, 0, 20, 20);
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
    var slice = new Slice(0, 0, 40, 20);
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

// Initialize board
function initializeBoard(){
  // Hide the start button
  $startBtn.hide();
  // Hide gameOver div
  $gameOver.hide();
  // Show score
  $score1.show();
  $score2.show();
  // Run the start method of the game
  game.start($gameWindow.width(), $gameWindow.height());
  // Create the ships
  for(var i = 0; i < 2; i++){
    shipsArray.push($('<div class="ship ' +'ship' + (i+1) + '">'));
  }
  // Append the ship to the board
  shipsArray.forEach(function($ship){
    $ship.appendTo($gameWindow);
  });
  // $gameWindow.append($ships);
  // Draw the Ship
  drawShips(game.ships);
  // Draw slices initial position
  drawSlices(game.slices);

  // Code from stackoverflow: http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
  var map = [];
  var onkeydown, onkeyup;
  onkeydown = onkeyup = function(e){
    map[e.keyCode] = e.type == 'keydown';
    /*insert conditional here*/
    if(map['65']){
      game.moveShip(-10, 0);
    }
    if(map['68']){
      game.moveShip(10, 0);
    }
    if(map['87']){
      game.addProjectile(0);
    }
    if(map['37']){
      game.moveShip(-10, 1);
    }
    if(map['38']){
      game.addProjectile(1);
    }
    if(map['39']){
      game.moveShip(10, 1);
    }

    drawShips(game.ships);
  };

  $(document).on('keydown', onkeydown);
  $(document).on('keyup', onkeyup);

  // Start the game loop id
  gameLoopId = window.setInterval(gameLoop, timeout);
}

// Draw the ship
// Has an absolute position relative to the game board
function drawShips(ships){
  ships.forEach(function(ship, index){
    shipsArray[index].
    css('width', ship.width).
    css('height', ship.height).
    css('bottom', 0).
    css('left', ship.x);
  });
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
  shipsArray.forEach(function(ship){ship.remove();});
  $('.slice').remove();
  $('.projectile').remove();
  $startBtn.show();
  $gameOver.show();
}

// Animation loop
function gameLoop(){
  // Move slices and projectiles in game obj
  game.moveSlices(-5);
  game.moveProjectiles(10);
  // Remove collided object
  game.removeCollided();
  // Redraw slices and projectiles
  drawProjectiles(game.projectiles);
  drawSlices(game.slices);
  // Draw score
  $score1.text('Score: ' + game.scores[0]);
  $score2.text('Score: ' + game.scores[1]);
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
  $score1 = $('.score.score1');
  $score2 = $('.score.score2');
  // On click run the start handler
  $startBtn.click(function(event){
    initializeBoard();
  });
});

}());
