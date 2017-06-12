'use strict';

var Game = function() {
  function setPlayerOneChoice(choice) {
    this.p1Choice = choice;
  }

  function setPlayerTwoChoice(choice) {
    this.p2Choice = choice;
  }

  function declareWinner() {
    if (this.p1Choice === 'rock') {
      if (this.p2Choice === 'scissors') {
        return 1;
      }
      if (this.p2Choice === 'paper') {
        return 2;
      }
      return 0;
    }
    if (this.p1Choice === 'paper') {
      if (this.p2Choice === 'rock') {
        return 1;
      }
      if (this.p2Choice === 'scissors') {
        return 2;
      }
      return 0;
    }

    if (this.p1Choice === 'scissors') {
      if (this.p2Choice === 'paper') {
        return 1;
      }
      if (this.p2Choice === 'rock') {
        return 2;
      }
      return 0;
    }
  }
};

$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: 'AIzaSyDqKoNT1rpDeSl2QVu6sK_YGMVfTzohops',
    authDomain: 'realtime-rps.firebaseapp.com',
    databaseURL: 'https://realtime-rps.firebaseio.com',
    projectId: 'realtime-rps',
    storageBucket: 'realtime-rps.appspot.com',
    messagingSenderId: '603566803686'
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  // DOM cache - player pieces
  var $playerOneTitleDiv = $('#playerOneTitle');
  var $playerTwoTitleDiv = $('#playerTwoTitle');
  var $playerOneGameArea = $('#playerOneGameArea');
  var $playerTwoGameArea = $('#playerTwoGameArea');
  var $playerOneGameButtons = [$('#p1-rock'), $('#p1-paper'), $('#p1-scissors')];
  var $playerTwoGameButtons = [$('#p2-rock'), $('#p2-paper'), $('#p2-scissors')];

  // DOM cache - sign in
  var $newUserSubmitBtn = $('#newUserSubmit');
  var $newUserName = $('#newUserName');
  var $signInRow = $('#signInRow');

  // DOM cache - chat window
  var $chatMessageBody = $('#chatBody');
  var $chatNewMessage = $('#chatMessage');
  var $chatSubmitBtn = $('#chatSubmit');

  // Constructor function for players
  function Player(username) {
    this.username = username;
  }

  // In-memory references to players and Game
  var game = {
    playerOne: null,
    playerTwo: null,
    signedInAs: null,
    isSignedIn: false,
    gameMachine: new Game()
  };

  // Event bindings
  $newUserSubmitBtn.on('click', signIn);
  $playerOneGameButtons.forEach(function(btn) {
    btn.on('click', submitPlayerOneMove);
  });
  $playerTwoGameButtons.forEach(function(btn) {
    btn.on('click', submitPlayerTwoMove);
  });

  // Runs on page load and when any data below 'players/' changes
  database.ref('players/').on('value', function(snap) {
    if (snap.child('playerOne').exists()) {
      game.playerOne = new Player(snap.child('playerOne/username').val());
      $playerOneTitleDiv.text(game.playerOne.username);
    } else {
      game.playerOne = null;
      $playerOneTitleDiv.text('Waiting for a new player');
    }
    if (snap.child('playerTwo').exists()) {
      game.playerTwo = new Player(snap.child('playerTwo/username').val());
      $playerTwoTitleDiv.text(game.playerTwo.username);
    } else {
      game.playerTwo = null;
      $playerTwoTitleDiv.text('Waiting for a new player');
    }
    toggleSignInBar();
  });

  function signIn() {
    var username = $newUserName.val().trim();
    if (username.length === 0) {
      return;
    }
    if (!game.playerOne) {
      // sign in as player one

      database.ref('players/playerOne').onDisconnect().remove();
      database
        .ref('players/playerOne')
        .set({
          username: username
        })
        .then(activatePlayerOne)
        .then(makePlayerOneMove)
        .catch(function(error) {
          console.error('Error with database write: ', error);
        });
    } else if (!game.playerTwo) {
      // sign in as player two

      database.ref('players/playerTwo').onDisconnect().remove();
      database
        .ref('players/playerTwo')
        .set({
          username: username
        })
        .then(activatePlayerTwo)
        .then(makePlayerTwoMove)
        .catch(function(error) {
          console.error('Error with database write: ', error);
        });
    } else {
      alert('Game is full!');
    }
  }

  function toggleSignInBar() {
    if (game.isSignedIn || (game.playerOne && game.playerTwo)) {
      $signInRow.fadeOut();
    }
    if (!game.isSignedIn && !(game.playerOne && game.playerTwo)) {
      $signInRow.fadeIn();
    }
  }

  // Sets the player in memory and updates the view
  function activatePlayerOne() {
    game.isSignedIn = true;
    game.signedInAs = 1;
  }

  function activatePlayerTwo() {
    game.isSignedIn = true;
    game.signedInAs = 2;
  }

  // Prompts players for their move
  function makePlayerOneMove() {
    $playerOneGameArea.slideDown();
  }

  function makePlayerTwoMove() {
    $playerTwoGameArea.slideDown();
  }

  function submitPlayerOneMove(e) {
    database.ref('game/playerOneChoice').onDisconnect().remove();
    database
      .ref('game/playerOneChoice')
      .set({ move: e.target.dataset.choice })
      .then(function() {
        $playerOneGameArea.text(`You chose ${e.target.dataset.choice}`);
      })
      .catch(function(error) {
        console.error('Error writing to database: ', error);
      });
  }
  function submitPlayerTwoMove(e) {
    database.ref('game/playerTwoChoice').onDisconnect().remove();
    database
      .ref('game/playerTwoChoice')
      .set({ move: e.target.dataset.choice })
      .then(function() {
        $playerTwoGameArea.text(`You chose ${e.target.dataset.choice}`);
      })
      .catch(function(error) {
        console.error('Error writing to database: ', error);
      });
  }

  // Hide game areas to start
  $playerOneGameArea.hide();
  $playerTwoGameArea.hide();
});
