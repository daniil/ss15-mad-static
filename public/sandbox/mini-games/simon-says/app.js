$(function() {
  var $container = $('#simon-says-container'),
      gridClass = 'simon-says-grid-block',
      grid = '',
      currStep = 3,
      currMove = [],
      currGameMode = 'lead';

  for (var i = 0; i < 25; i++) {
    grid += '<div class="' + gridClass + '" id="' + gridClass + '_' + i + '" data-grid-id="' + i + '"></div>';
  }

  $container.html(grid);
  updateUI();

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
      runDelayedFn(1000, playbackMove);
    }

    updateUI();
  }

  function playbackMove() {
    console.log('Current move: ', currMove);

    $('.' + gridClass).removeClass('inactive');

    $.each(currMove, function(i, val) {
      animateMove(i, val);
    });

    runDelayedFn((currMove.length * 750) + 200, function() {
      currGameMode = 'follow';
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
    $('.simon-says-steps-counter').text(currStep);
  }

  function runDelayedFn(delay, fn) {
    var delayTimeout = setTimeout(function() {
      fn();
      clearTimeout(delayTimeout);
    }, delay);
  }

});