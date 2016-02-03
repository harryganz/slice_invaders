(function() {
'use strict';
// Html Elements
var $gameWindow;
var $startBtn;

// Game object
var game = {
  start: function(){
    console.log('Game Started');
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
