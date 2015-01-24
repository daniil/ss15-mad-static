$(function() {
  var $container = $('#simon-says-container'),
      gridClass = 'simon-says-grid-block',
      grid = '',
      currStep = 3,
      currMove = [],
      isGameActive = true;

  for (var i = 0; i < 25; i++) {
    grid += '<div class="' + gridClass + '" id="' + gridClass + '_' + i + '" data-grid-id="' + i + '"></div>';
  }

  $container.html(grid);
  $('.simon-says-steps-counter').text(currStep);

  $('.' + gridClass).hammer().bind('tap', function(e) {
    if (currStep === 0) return;
    
    currMove.push($(e.target).data('grid-id'));

    $(e.target).addClass('active');
    var animationTimeout = setTimeout(function() {
      $(e.target).removeClass('active');
      clearTimeout(animationTimeout);
    }, 200);

    updateSteps();
  });

  function updateSteps() {
    currStep --;

    if (currStep === 0) {
      $('.' + gridClass).addClass('inactive');
      var playbackTimeout = setTimeout(function() {
        playbackMove();
      }, 1000);
    }

    $('.simon-says-steps-counter').text(currStep);
  }

  function playbackMove() {
    console.log('Current move: ', currMove);

    $('.' + gridClass).removeClass('inactive');

    $.each(currMove, function(i, val) {
      animateMove(i, val);
    });
  }

  function animateMove(i, val) {
    var queueTimeout = setTimeout(function() {
      $('.' + gridClass).eq(val).addClass('active');
      var animationTimeout = setTimeout(function() {
        $('.' + gridClass).eq(val).removeClass('active');
        clearTimeout(animationTimeout);
      }, 250);
      clearTimeout(queueTimeout);
    }, i * 750);    
  }

});