$(function() {
  var fbRef = new Firebase("https://snl-room-simon-says.firebaseio.com"),
      $container = $('#simon-says-container'),
      gridClass = 'simon-says-grid-block',
      grid = '',
      currMove = [],
      currRole = '',
      steps = {
        starting: 3,
        roundStep: 1,
        currStep: 3,
        round: 0,
        timeLimit: 60
      },
      isInteractive = true,
      fbPlayerRef,
      playerId,
      gameTimer;

  fbPlayerRef = fbRef.child('players').push({
    score: 0
  });

  fbPlayerRef.on('value', function(s) {
    playerId = s.key();
    currRole = s.val().role;

    if (s.val().role === 'lead') {

      isInteractive = true;

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">lead</span> role. Tap out your pattern!</p>');

    } else if (s.val().role === 'wait') {

      isInteractive = false;

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">wait</span> role. Wait until your opponent taps out a pattern.</p>');

    } else if (s.val().role === 'follow') {

      isInteractive = false;

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">follow</span> role. Repeat the pattern.</p>');

    }

    updateUI();
  });

  fbPlayerRef.onDisconnect().remove();

  // Setup initial roles, first join leads, other waits
  fbRef.child('players').once('value', function(s) {
    if (Object.keys(s.val()).length === 1) {
      fbPlayerRef.update({ 'role': 'lead' });
    } else {
      fbPlayerRef.update({ 'role': 'wait' });
    }
  });

  fbRef.child('players').on('child_added', function(s) {
    updateUI();
  });

  fbRef.child('moves').on('child_added', function(s) {
    console.log('Move made', s.val());

    if (s.val().type === 'lead') {
      if (currRole === 'lead') {
        fbPlayerRef.update({
          role: 'wait'
        });
      } else if (currRole === 'wait') {
        fbPlayerRef.update({
          role: 'follow'
        });
        currMove = s.val().pattern;
        runDelayedFn(1000, playbackMove);
      }
    } else if (s.val().type === 'follow') {
      if (currRole === 'follow') {
        fbPlayerRef.update({
          role: 'lead'
        });
        currMove = [];
      } else if (currRole === 'wait') {
        updateUI();
      }
      steps.round++;
    }

    steps.currStep = steps.starting + (steps.round * steps.roundStep);
    updateStepsUI();
  });

  fbRef.child('moves').onDisconnect().remove();

  for (var i = 0; i < 25; i++) {
    grid += '<div class="' + gridClass + '" id="' + gridClass + '_' + i + '" data-grid-id="' + i + '"></div>';
  }

  $container.html(grid);
  updateStepsUI();

  $container.on('click', '.' + gridClass, function(e) {
    var returnImmediate = false;

    if (!isInteractive || steps.currStep === 0) return;
    
    if (currRole === 'lead') {
      currMove.push($(e.target).data('grid-id'));
    } else if (currRole === 'follow') {
      // Wrong pattern, return immediately and score +1 to opponent
      if (currMove[currMove.length - steps.currStep] !== $(e.target).data('grid-id')) {
        $(e.target).addClass('wrong');
        runDelayedFn(500, function() {
          $(e.target).removeClass('wrong');
        });
        updateScore(false);
        returnImmediate = true;
      } else {
        // Got full pattern right, score +1 to contender
        if (steps.currStep === 1) {
          updateScore(true);
        }
      }
    }

    if (!returnImmediate) {
      $(e.target).addClass('active');
      runDelayedFn(200, function() {
        $(e.target).removeClass('active');
      });

      runDelayedFn(500, updateSteps);
    } else {
      steps.currStep = 1;
      updateSteps();
    }
    
  });

  function updateSteps() {
    steps.currStep --;

    if (steps.currStep === 0) {
      makeMove();
    }

    updateStepsUI();
  }

  function makeMove() {
    fbRef.child('moves').push({
      player: playerId,
      pattern: currMove,
      type: currRole
    });
  }

  function playbackMove() {
    console.log('Current move: ', currMove);

    $('.' + gridClass).removeClass('inactive');

    $.each(currMove, function(i, val) {
      animateMove(i, val);
    });

    runDelayedFn((currMove.length * 750) + 200, function() {
      isInteractive = true;
      steps.currStep = currMove.length;
      updateUI();
    });
  }

  function animateMove(i, val) {
    runDelayedFn(i * 750, function() {
      $('.' + gridClass).eq(val).addClass('active');
      runDelayedFn(250, function() {
        $('.' + gridClass).eq(val).removeClass('active');
      });
    });   
  }

  function updateStepsUI() {
    $('.simon-says-steps-counter').text(steps.currStep);
  }

  function updateUI() {
    fbRef.child('players').once('value', function(s) {
      if (Object.keys(s.val()).length === 2) {
        // When two people join, show the game board and start the timer
        $('.simon-says-lobby').hide();
        $('.simon-says-game').show();
        
        if (!gameTimer) {
          gameTimer = setInterval(updateGameTimer, 1000);
        }
      }

      $.each(s.val(), function(i, val) {
        if (i === playerId) {
          $('.simon-says-score-mine').text(val.score);
        } else {
          $('.simon-says-score-opp').text(val.score);
        }
      });
    });

    if (currRole === 'wait') {
      $('.' + gridClass).addClass('inactive');
    } else if (currRole === 'lead' || currRole === 'follow') {
      $('.' + gridClass).removeClass('inactive');
    }
  }

  function updateScore(isWinner) {
    fbRef.child('players').once('value', function(s) {
      $.each(s.val(), function(i, val) {
        if (isWinner) {
          if (i === playerId) {
            fbRef.child('players').child(i).update({
              score: val.score + 1
            });
          }
        } else {
          if (i !== playerId) {
            fbRef.child('players').child(i).update({
              score: val.score + 1
            });
          }
        }
      });
    });
  }

  function updateGameTimer() {
    steps.timeLimit--;
    $('.simon-says-game-timer-value').text(steps.timeLimit);

    if (steps.timeLimit === 30) {
      $('.simon-says-game-timer-value').addClass('caution');
    } else if (steps.timeLimit === 15) {
      $('.simon-says-game-timer-value').removeClass('caution').addClass('warning');
    }

    if (steps.timeLimit === 0) {
      clearInterval(gameTimer);
      finishGame();
    }
  }

  function finishGame() {
    console.log('GAME FINISHED');
  }

  function runDelayedFn(delay, fn) {
    var delayTimeout = setTimeout(function() {
      fn();
      clearTimeout(delayTimeout);
    }, delay);
  }

});