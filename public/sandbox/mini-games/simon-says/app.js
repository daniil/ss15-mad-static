$(function() {
  var fbRef = new Firebase("https://snl-room-simon-says.firebaseio.com"),
      players = {},
      $container = $('#simon-says-container'),
      gridClass = 'simon-says-grid-block',
      grid = '',
      currMove = [],
      currRole = '',
      currStep,
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

      $('.simon-says-role').html('<p>You\'re in <span class="simon-says-role-type">follow</span> role.</p><p>Wait until the lead taps out a pattern.</p>');

    }

    updateUI();
  });

  fbPlayerRef.onDisconnect().remove();

  fbRef.child('settings').once('value', function(s) {
    currStep = s.startingSteps;
  });

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
  });

  for (var i = 0; i < 25; i++) {
    grid += '<div class="' + gridClass + '" id="' + gridClass + '_' + i + '" data-grid-id="' + i + '"></div>';
  }

  $container.html(grid);

  $('.' + gridClass).hammer().bind('tap', function(e) {
    if (currStep === 0) return;
    
    currMove.push($(e.target).data('grid-id'));

    $(e.target).addClass('active');
    runDelayedFn(200, function() {
      $(e.target).removeClass('active');
    });

    runDelayedFn(500, updateSteps);
  });

  function updateSteps() {
    currStep --;

    if (currStep === 0) {
      $('.' + gridClass).addClass('inactive');
      makeMove();
    }

    $('.simon-says-steps-counter').text(currStep);
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
      currStep = currMove.length;
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

  function updateUI() {
    fbRef.child('players').once('value', function(s) {
      if (Object.keys(s.val()).length === 2) {
        $('.simon-says-lobby').hide();
        $('.simon-says-game').show();
      }
    });

    if (currRole === 'wait') {
      $('.' + gridClass).addClass('inactive');
    }
  }

  function runDelayedFn(delay, fn) {
    var delayTimeout = setTimeout(function() {
      fn();
      clearTimeout(delayTimeout);
    }, delay);
  }

});