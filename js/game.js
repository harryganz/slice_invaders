(function() {
  'use strict';
  // Html Elements
  var $gameWindow;
  var $startBtn;


  function startHandler(event){
    // Hide the start button
    $startBtn.hide();
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
