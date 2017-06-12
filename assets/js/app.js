'use strict';

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

  // In-memory references to players
  var game = {
    playerOne: null,
    playerTwo: null
  };

  var isSignedIn = false;

  // Event bindings
  $newUserSubmitBtn.on('click', signIn);

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
      isSignedIn = true;
      database.ref('players/playerOne').onDisconnect().remove();
      database.ref('players/playerOne').set({
        username: username
      });
    } else if (!game.playerTwo) {
      // sign in as player two
      isSignedIn = true;
      database.ref('players/playerTwo').onDisconnect().remove();
      database.ref('players/playerTwo').set({
        username: username
      });
    } else {
      alert('Game is full!');
    }
  }

  function toggleSignInBar() {
    if (isSignedIn || (game.playerOne && game.playerTwo)) {
      $signInRow.fadeOut();
    }
    if (!isSignedIn && !(game.playerOne && game.playerTwo)) {
      $signInRow.fadeIn();
    }
  }
});
