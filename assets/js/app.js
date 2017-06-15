'use strict';

var App = (function() {
  var $playerOneTitleDiv,
    $playerTwoTitleDiv,
    $playerOneGameArea,
    $playerTwoGameArea,
    $playerOneGameButtons,
    $playerTwoGameButtons,
    $newUserSubmitBtn,
    $newUserName,
    $signInForm,
    $navbar,
    chat;

  // Initialize Firebase
  var database = firebaseModule.database;

  // Constructor function for players
  function Player(username) {
    this.username = username;
  }

  // In-memory references to players and Game
  var game = {
    key: null,
    finished: null,
    playerOne: null,
    playerOneChoice: null,
    playerTwo: null,
    playerTwoChoice: null,
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

  function signIn(e) {
    e.preventDefault();
    var username = $newUserName.val().trim();
    if (username.length === 0) {
      return;
    }
    $navbar.html(
      $('<p></p>')
        .addClass('navbar-text')
        .addClass('pull-right')
        .attr('data-username', username)
        .attr('id', 'username')
        .text(`Signed in as ${username}`)
    );
    chat.enableChat();
    if (!game.playerOne) {
      // sign in as player one
      database.ref(`game/${game.key}/players/playerOne`).onDisconnect().remove();
      database
        .ref(`game/${game.key}/players/playerOne`)
        .set({ username: username })
        .then(activatePlayerOne)
        .then(makePlayerOneMove)
        .catch(function(error) {
          console.error('Error with database write: ', error);
        });
    } else if (!game.playerTwo) {
      // sign in as player two
      database.ref(`game/${game.key}/players/playerTwo`).onDisconnect().remove();
      database
        .ref(`game/${game.key}/players/playerTwo`)
        .set({ username: username })
        .then(activatePlayerTwo)
        .then(makePlayerTwoMove)
        .catch(function(error) {
          console.error('Error with database write: ', error);
        });
    } else {
      alert('Game is full!');
    }
  }

  function setGameKey() {
    if (!game.key) {
      console.info('No game running, starting a new one');
      let gameRef = database.ref('game').push();
      game.key = gameRef.key;
      console.info('Started game: ', game.key);
      gameRef
        .set({
          created: true
        })
        .then(setDatabaseListeners)
        .catch(function(error) {
          console.log('Error writing to database: ', error);
        });
    }
  }

  function submitPlayerOneMove(e) {
    database.ref('game/' + game.key).onDisconnect().set({ finished: true });
    database.ref('game/' + game.key + '/playerOne').set({ choice: e.target.dataset.choice }).catch(function(error) {
      console.error('Error writing to database: ', error);
    });
  }

  function submitPlayerTwoMove(e) {
    database.ref('game/' + game.key).onDisconnect().set({ finished: true });
    database.ref('game/' + game.key + '/playerTwo').set({ choice: e.target.dataset.choice }).catch(function(error) {
      console.error('Error writing to database: ', error);
    });
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

  function evaluateTurns() {
    if (game.playerOneChoice && game.playerTwoChoice) {
      writeGameResult(game.playerOneChoice, game.playerTwoChoice);
    } else if (game.playerOneChoice && !game.playerTwoChoice) {
      writePlayerOneGameMove(game.playerOneChoice);
    } else if (game.playerTwoChoice && !game.playerOneChoice) {
      writePlayerTwoGameMove(game.playerTwoChoice);
    }
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

  function setDatabaseListeners() {
    // Watch for players joining
    database.ref(`game/${game.key}/players/`).on('value', function(snap) {
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

    // Watch for player one moves
    database.ref(`game/${game.key}/playerOne/choice`).on('value', function(snap) {
      game.playerOneChoice = snap.val();
      evaluateTurns();
    });

    // Watch for player two moves
    database.ref(`game/${game.key}/playerTwo/choice`).on('value', function(snap) {
      game.playerTwoChoice = snap.val();
      evaluateTurns();
    });
  }

  function init() {
    // DOM cache - sign in
    $newUserSubmitBtn = $('#newUserSubmit');
    $newUserName = $('#newUserName');
    $signInForm = $('#signInForm');
    $navbar = $('#navbar');
    // DOM cache - player pieces
    $playerOneTitleDiv = $('#playerOneTitle');
    $playerTwoTitleDiv = $('#playerTwoTitle');
    $playerOneGameArea = $('#playerOneGameArea');
    $playerTwoGameArea = $('#playerTwoGameArea');
    $playerOneGameButtons = [$('#p1-rock'), $('#p1-paper'), $('#p1-scissors')];
    $playerTwoGameButtons = [$('#p2-rock'), $('#p2-paper'), $('#p2-scissors')];

    // Instantiate chat module, load messages, and listen for new ones
    chat = new Chat({
      chatBody: '#chatBody',
      chatMessage: '#chatMessage',
      chatBtn: '#chatSubmit'
    });
    chat.listenForMessages();

    // Event bindings
    $newUserSubmitBtn.on('click', signIn);
    $playerOneGameButtons.forEach(function(btn) {
      btn.on('click', submitPlayerOneMove);
    });
    $playerTwoGameButtons.forEach(function(btn) {
      btn.on('click', submitPlayerTwoMove);
    });

    // Hide game areas to start
    $playerOneGameArea.hide();
    $playerTwoGameArea.hide();

    // Watch for new game
    database.ref('game/').limitToLast(1).on('value', function(snap) {
      if (game.finished) {
        //
      }
      if (!game.key) {
        if (snap.val()) {
          let key = '';
          for (var n in snap.val()) {
            key = n;
          }
          if (!snap.child(key + '/finished').exists()) {
            game.key = key;
            setDatabaseListeners();
            console.log('Joined the game: ', game.key);
          } else {
            setGameKey();
          }
        } else {
          console.log('Nothing in the snapshot!');
          return;
        }
      }
    });
  }

  return {
    init: init
  };
})();

$(document).ready(App.init);

// TODO: Find way to improve game reloading experience
