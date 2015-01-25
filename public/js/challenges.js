(function() {
  var challenges = { 

    challengeRef: new Firebase(fb.challengeUrl),

    roomRef: null,

    playerRef: null,

    challengeStarted: false,

    $container: $('#simon-says-game-container'),

    gridClass: 'simon-says-grid-block',

    currMove: [],

    currRole: '',

    steps: {
      starting: 3,
      roundStep: 1,
      currStep: 3,
      round: 0,
      timeLimit: 25
    },

    isInteractive: true,

    gameTimer: null,

    init: function() {
      challenges.roomRef = challenges.challengeRef.child(game.roomId);

      challenges.playerRef = challenges.roomRef.child('players').child(game.playerId);

      challenges.playerRef.on('value', function(s) {
        if (s.val()) {

          if (!challenges.challengeStarted) {
            challenges.initEvents();
            challenges.initMoves();
            challenges.generateHtml();
          }

          $('#simon-says-container').show();
          $('#game-board').hide();
          $('#hud').hide();

          challenges.processChange(s);

          challenges.challengeStarted = true;

        } else {

          $('#simon-says-container').hide();
          $('#game-board').show();
          $('#hud').show();

        }
      });

      challenges.updateStepsUI();
    },

    initEvents: function() {
      challenges.$container.on('click', '.' + challenges.gridClass, function(e) {
        var returnImmediate = false;

        if (!challenges.isInteractive || challenges.steps.currStep === 0) return;
        
        if (challenges.currRole === 'lead') {
          challenges.currMove.push($(e.target).data('grid-id'));
        } else if (challenges.currRole === 'follow') {
          // Wrong pattern, return immediately and score +1 to opponent
          if (challenges.currMove[challenges.currMove.length - challenges.steps.currStep] !== $(e.target).data('grid-id')) {
            $('.' + challenges.gridClass).addClass('wrong');
            challenges.runDelayedFn(500, function() {
              $('.' + challenges.gridClass).removeClass('wrong');
            });
            challenges.updateScore(false);
            returnImmediate = true;
          } else {
            // Got full pattern right, score +1 to contender
            if (challenges.steps.currStep === 1) {
              challenges.updateScore(true);
            }
          }
        }

        if (!returnImmediate) {
          $(e.target).addClass('active');
          challenges.runDelayedFn(200, function() {
            $(e.target).removeClass('active');
          });

          challenges.runDelayedFn(500, challenges.updateSteps);
        } else {
          challenges.steps.currStep = 1;
          challenges.updateSteps();
        }
        
      });

      $(window).off('resize.simon-says').on('resize.simon-says', function() {
        var $gridBlock = $('.simon-says-grid-block')
        $gridBlock.height($gridBlock.innerWidth());
      });
    },

    initMoves: function() {
      challenges.roomRef.child('moves').on('child_added', function(s) {
        console.log('Move made', s.val());

        if (s.val().type === 'lead') {
          if (challenges.currRole === 'lead') {
            challenges.playerRef.update({
              role: 'wait'
            });
          } else if (challenges.currRole === 'wait') {
            challenges.playerRef.update({
              role: 'follow'
            });
            challenges.currMove = s.val().pattern;
            challenges.runDelayedFn(1000, challenges.playbackMove);
          }
        } else if (s.val().type === 'follow') {
          if (challenges.currRole === 'follow') {
            challenges.playerRef.update({
              role: 'lead'
            });
            challenges.currMove = [];
          } else if (challenges.currRole === 'wait') {
            challenges.updateUI();
          }
          challenges.steps.round++;
        }

        challenges.steps.currStep = challenges.steps.starting + (challenges.steps.round * challenges.steps.roundStep);
        challenges.updateStepsUI();
      });

      challenges.roomRef.child('moves').onDisconnect().remove();
    },

    generateHtml: function() {
      var grid = '';

      for (var i = 0; i < 25; i++) {
        grid += '<div class="' + challenges.gridClass + '" id="' + challenges.gridClass + '_' + i + '" data-grid-id="' + i + '"></div>';
      }

      challenges.$container.html(grid);
      challenges.runDelayedFn(100, function() {
        $(window).trigger('resize.simon-says');
      });
    },

    startChallenge: function(player1Id, player2Id, points) {
      var playersObj = {};

      playersObj[player1Id] = {
        role: 'lead',
        score: 0
      };

      playersObj[player2Id] = {
        role: 'wait',
        score: 0
      };

      challenges.roomRef.set({
        players: playersObj,
        points: points
      });
    },

    processChange: function(s) {
      challenges.currRole = s.val().role;

      if (s.val().role === 'lead') {

        challenges.isInteractive = true;

        game.displayMessage('<p>It\'s your turn! Tap out your pattern!</p>');

      } else if (s.val().role === 'wait') {

        challenges.isInteractive = false;

        game.displayMessage('<p>Wait until your opponent taps out a pattern.</p>');

      } else if (s.val().role === 'follow') {

        challenges.isInteractive = false;

        game.displayMessage('<p>Repeat the pattern.</p>');

      }

      challenges.updateUI();
    },

    updateSteps: function() {
      challenges.steps.currStep --;

      if (challenges.steps.currStep === 0) {
        challenges.makeMove();
      }

      challenges.updateStepsUI();
    },

    makeMove: function() {
      challenges.roomRef.child('moves').push({
        player: game.playerId,
        pattern: challenges.currMove,
        type: challenges.currRole
      });
    },

    playbackMove: function() {
      console.log('Current move: ', challenges.currMove);

      $('.' + challenges.gridClass).removeClass('inactive');

      $.each(challenges.currMove, function(i, val) {
        challenges.animateMove(i, val);
      });

      challenges.runDelayedFn((challenges.currMove.length * 750) + 200, function() {
        challenges.isInteractive = true;
        challenges.steps.currStep = challenges.currMove.length;
        challenges.updateUI();
      });
    },

    animateMove: function(i, val) {
      challenges.runDelayedFn(i * 750, function() {
        $('.' + challenges.gridClass).eq(val).addClass('active');
        challenges.runDelayedFn(250, function() {
          $('.' + challenges.gridClass).eq(val).removeClass('active');
        });
      });   
    },

    updateStepsUI: function() {
      $('.simon-says-steps-counter').text(challenges.steps.currStep);
    },

    updateUI: function() {
      challenges.roomRef.child('players').once('value', function(s) {
        if (!s.val()) return;
        
        if (Object.keys(s.val()).length === 2) {
          // When two people join, show the game board and start the timer
          $('.simon-says-lobby').hide();
          $('.simon-says-game').show();
          
          if (!challenges.gameTimer) {
            challenges.gameTimer = setInterval(challenges.updateGameTimer, 1000);
          }
        }

        $.each(s.val(), function(i, val) {
          if (i === game.playerId) {
            $('.simon-says-score-mine').text(val.score);
          } else {
            $('.simon-says-score-opp').text(val.score);
          }
        });
      });

      if (challenges.currRole === 'wait') {
        $('.' + challenges.gridClass).addClass('inactive');
      } else if (challenges.currRole === 'lead' || challenges.currRole === 'follow') {
        $('.' + challenges.gridClass).removeClass('inactive');
      }
    },

    updateScore: function(isWinner) {
      challenges.roomRef.child('players').once('value', function(s) {
        $.each(s.val(), function(i, val) {
          if (isWinner) {
            if (i === game.playerId) {
              challenges.roomRef.child('players').child(i).update({
                score: val.score + 1
              });
            }
          } else {
            if (i !== game.playerId) {
              challenges.roomRef.child('players').child(i).update({
                score: val.score + 1
              });
            }
          }
          challenges.updateUI();
        });
      });
    },

    updateGameTimer: function() {
      challenges.steps.timeLimit--;
      $('.simon-says-game-timer-value').text(challenges.steps.timeLimit);

      if (challenges.steps.timeLimit === 30) {
        $('.simon-says-game-timer-value').addClass('caution');
      } else if (challenges.steps.timeLimit === 15) {
        $('.simon-says-game-timer-value').removeClass('caution').addClass('warning');
      }

      if (challenges.steps.timeLimit === 0) {
        clearInterval(challenges.gameTimer);
        challenges.gameTimer = null;
        challenges.finishGame();
      }
    },

    finishGame: function() {
      console.log('GAME FINISHED');

      challenges.roomRef.once("value", function(snap) {
        // console.log(snap.val());
        game.miniChallengeFinished(snap.val());
      });
    },

    resetChallenge: function() {
      challengeStarted = false;

      challenges.steps = {
        starting: 3,
        roundStep: 1,
        currStep: 3,
        round: 0,
        timeLimit: 25
      };

      $('.simon-says-game-timer-value').text(challenges.steps.timeLimit);

      challenges.roomRef.child('players').remove();
    },

    runDelayedFn: function(delay, fn) {
      var delayTimeout = setTimeout(function() {
        fn();
        clearTimeout(delayTimeout);
      }, delay);
    }

  };

  window.challenges = challenges;

})();
