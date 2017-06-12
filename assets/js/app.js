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
    if (!snap.exists()) {
      // no data set yet so just return
      return;
    }
    if (snap.child('playerOne').exists()) {
      console.log('hello');
      game.playerOne = new Player(snap.child('playerOne/username').val());
      $playerOneTitleDiv.text(game.playerOne.username);
    }
    if (snap.child('playerTwo').exists()) {
      game.playerTwo = new Player(snap.child('playerTwo/username').val());
      $playerTwoTitleDiv.text(game.playerTwo.username);
    }
    if (game.playerOne && game.playerTwo) {
      $signInRow.hide();
    }
  });

  function signIn() {
    var username = $newUserName.val().trim();
    if (username.length === 0) {
      return;
    }
    if (!game.playerOne) {
      // sign in as player one
      database.ref('players/playerOne').set({
        username: username
      });
      $signInRow.fadeToggle();
    } else if (!game.playerTwo) {
      // sign in as player two
      database.ref('players/playerTwo').set({
        username: username
      });
      $signInRow.fadeToggle();
    } else {
      alert('Game is full!');
    }
  }
});
