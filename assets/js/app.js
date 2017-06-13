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
  var $playerOneGameArea = $('#playerOneGameArea');
  var $playerTwoGameArea = $('#playerTwoGameArea');
  var $playerOneGameButtons = [$('#p1-rock'), $('#p1-paper'), $('#p1-scissors')];
  var $playerTwoGameButtons = [$('#p2-rock'), $('#p2-paper'), $('#p2-scissors')];

  // DOM cache - sign in
  var $newUserSubmitBtn = $('#newUserSubmit');
  var $newUserName = $('#newUserName');
  var $signInForm = $('#signInForm');
  var $navbar = $('#navbar');

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
    key: null,
    playerOne: null,
    playerTwo: null,
    signedInAs: null,
    isSignedIn: false,
    declareWinner: function(p1Choice, p2Choice) {
      if (p1Choice === 'rock') {
        if (p2Choice === 'scissors') {
          return 1;
        }
        if (p2Choice === 'paper') {
          return 2;
        }
        return 0;
      }
      if (p1Choice === 'paper') {
        if (p2Choice === 'rock') {
          return 1;
        }
        if (p2Choice === 'scissors') {
          return 2;
        }
        return 0;
      }

      if (p1Choice === 'scissors') {
        if (p2Choice === 'paper') {
          return 1;
        }
        if (p2Choice === 'rock') {
          return 2;
        }
        return 0;
      }
    }
  };

  // Event bindings
  $newUserSubmitBtn.on('click', signIn);
  $playerOneGameButtons.forEach(function(btn) {
    btn.on('click', submitPlayerOneMove);
  });
  $playerTwoGameButtons.forEach(function(btn) {
    btn.on('click', submitPlayerTwoMove);
  });

  /*
   * Database value listeners
   */
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

  database.ref('game/').limitToLast(1).on('value', function(snap) {
    if (!game.key) {
      if (snap.val()) {
        let key = '';
        for (var n in snap.val()) {
          key = n;
        }
        if (!snap.child(key + '/finished').exists()) {
          game.key = key;
          console.log('Joined the game: ', game.key);
        }
      } else {
        console.log('Nothing in the snapshot!');
        return;
      }
    }

    if (snap.child(game.key + '/playerOne/choice').exists() && snap.child(game.key + '/playerTwo/choice').exists()) {
      let p1Choice = snap.child(game.key + '/playerOne/choice').val();
      let p2Choice = snap.child(game.key + '/playerTwo/choice').val();
      writeGameResult(p1Choice, p2Choice);
    } else if (
      snap.child(game.key + '/playerOne/choice').exists() &&
      !snap.child(game.key + '/playerTwo/choice').exists()
    ) {
      writePlayerOneGameMove(snap.child(game.key + '/playerOne/choice').val());
    } else if (
      snap.child(game.key + '/playerTwo/choice').exists() &&
      !snap.child(game.key + '/playerOne/choice').exists()
    ) {
      writePlayerTwoGameMove(snap.child(game.key + '/playerTwo/choice').val());
      game.key = null;
    }
  });

  function signIn(e) {
    e.preventDefault();
    var username = $newUserName.val().trim();
    $navbar.html($('<p></p>').addClass('navbar-text').addClass('pull-right').text(`Signed in as ${username}`));
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
      $signInForm.fadeOut();
    }
    if (!game.isSignedIn && !(game.playerOne && game.playerTwo)) {
      $signInForm.fadeIn();
    }
  }

  // Sets the player in memory and updates the view
  function activatePlayerOne() {
    game.isSignedIn = true;
    game.signedInAs = 1;
    toggleSignInBar();
  }

  function activatePlayerTwo() {
    game.isSignedIn = true;
    game.signedInAs = 2;
    toggleSignInBar();
  }

  // Prompts players for their move
  function makePlayerOneMove() {
    $playerOneGameArea.slideDown();
  }

  function makePlayerTwoMove() {
    $playerTwoGameArea.slideDown();
  }

  function submitPlayerOneMove(e) {
    if (!game.key) {
      console.info('No game running, starting a new one');
      game.key = database.ref('game').push().key;
    }
    database.ref('game/' + game.key).onDisconnect().set({ finished: true });
    database.ref('game/' + game.key + '/playerOne').set({ choice: e.target.dataset.choice }).catch(function(error) {
      console.error('Error writing to database: ', error);
    });
  }

  function submitPlayerTwoMove(e) {
    if (!game.key) {
      console.info('No game running, starting a new one');
      game.key = database.ref('game').push().key;
    }
    database.ref('game/' + game.key).onDisconnect().set({ finished: true });
    database.ref('game/' + game.key + '/playerTwo').set({ choice: e.target.dataset.choice }).catch(function(error) {
      console.error('Error writing to database: ', error);
    });
  }

  function writeGameResult(p1Choice, p2Choice) {
    let winner = game.declareWinner(p1Choice, p2Choice);

    let $p1 = $('<h4></h4>').text(`Player one chose ${p1Choice}.`);
    let $p2 = $('<h4></h4>').text(`Player two chose ${p2Choice}.`);

    $playerOneGameArea.empty();
    $playerTwoGameArea.empty();

    $playerOneGameArea.append([$p1, $('<h3></h3>').text(`Player ${winner} wins!`)]);
    $playerTwoGameArea.append([$p2, $('<h3></h3>').text(`Player ${winner} wins!`)]);

    $playerOneGameArea.show();
    $playerTwoGameArea.show();
  }

  function writePlayerOneGameMove(choice) {
    $playerOneGameArea.empty();
    if (game.signedInAs === 1) {
      $playerOneGameArea.append($('<h4></h4>').text(`You chose ${choice}`));
      $playerTwoGameArea.empty();
      $playerTwoGameArea.append($('<h4></h4>').text("Waiting for player two's choice"));
      $playerTwoGameArea.fadeIn();
    } else if (game.signedInAs === 2) {
      $playerOneGameArea.append($('<h4></h4>').text('Player one ready! Make your move!'));
    } else {
      if (game.playerOne && game.playerTwo) {
        $playerOneGameArea.append($('<h4></h4>').text(`Player one chose ${choice}`));
        $playerTwoGameArea.empty();
        $playerTwoGameArea.append($('<h4></h4>').text("Waiting for player two's choice"));
        $playerTwoGameArea.fadeIn();
      } else {
        $playerOneGameArea.append($('<h4></h4>').text('Player one ready! Join now and play!'));
      }
    }
    $playerOneGameArea.fadeIn();
  }

  function writePlayerTwoGameMove(choice) {
    $playerTwoGameArea.empty();
    if (game.signedInAs === 2) {
      $playerTwoGameArea.append($('<h4></h4>').text(`You chose ${choice}`));
      $playerOneGameArea.empty();
      $playerOneGameArea.append($('<h4></h4>').text("Waiting for player one's choice"));
      $playerOneGameArea.fadeIn();
    } else if (game.signedInAs === 1) {
      $playerTwoGameArea.append($('<h4></h4>').text('Player two ready! Make your move!'));
    } else {
      if (game.playerOne && game.playerTwo) {
        $playerTwoGameArea.append($('<h4></h4>').text(`Player two chose ${choice}`));
        $playerOneGameArea.empty();
        $playerOneGameArea.append($('<h4></h4>').text("Waiting for player one's choice"));
        $playerOneGameArea.fadeIn();
      } else {
        $playerTwoGameArea.append($('<h4></h4>').text('Player two ready! Join now and play!'));
      }
    }
    $playerTwoGameArea.fadeIn();
  }

  // Hide game areas to start
  $playerOneGameArea.hide();
  $playerTwoGameArea.hide();
});
