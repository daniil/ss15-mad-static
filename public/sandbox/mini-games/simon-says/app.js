$(function() {
  var fbRef = new Firebase("https://snl-room-simon-says.firebaseio.com"),
      players = {},
      $container = $('#simon-says-container'),
      gridClass = 'simon-says-grid-block',
      grid = '',
      currMove = [],
      currRole = '',
      steps = {
        starting: 3,
        roundStep: 2,
        currStep: 3,
        round: 0
      },
      fbPlayerRef,
      playerId;

  fbPlayerRef = fbRef.child('players').push({
    score: 0
  });

  fbPlayerRef.on('value', function(s) {
    playerId = s.key();
    currRole = s.val().role;

    if (s.val().role === 'lead') {

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">lead</span> role.</p><p>Tap out your pattern!</p>');

    } else if (s.val().role === 'wait') {

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">wait</span> role.</p><p>Wait until your opponent taps out a pattern.</p>');

    } else if (s.val().role === 'follow') {

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">follow</span> role.</p><p>Repeat the pattern.</p>');

    }

    updateUI();
  });

  fbPlayerRef.onDisconnect().remove();

  fbRef.child('players').once('value', function(s) {
    if (Object.keys(s.val()).length === 1) {
      fbPlayerRef.update({ 'role': 'lead' });
    } else {
      fbPlayerRef.update({ 'role': 'wait' });
    }
  });

  fbRef.child('players').on('child_added', function(s) {
    players[s.key()] = s.val();
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
        runDelayedFn(3000, playbackMove);
      }
    } else if (s.val().type === 'follow') {
      if (currRole === 'follow') {
        fbPlayerRef.update({
          role: 'lead'
        });
        currMove = [];
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

  $('.' + gridClass).hammer().bind('tap', function(e) {
    var returnImmediate = false;

    if (steps.currStep === 0) return;
    
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
      if (currRole === 'follow') {
        updateScore(true);
      }

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
        $('.simon-says-lobby').hide();
        $('.simon-says-game').show();
      }
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

  function runDelayedFn(delay, fn) {
    var delayTimeout = setTimeout(function() {
      fn();
      clearTimeout(delayTimeout);
    }, delay);
  }

});