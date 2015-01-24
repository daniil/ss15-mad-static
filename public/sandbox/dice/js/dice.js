$(function() {
		
	var x = 0, y = 0,
	    vx = 0, vy = 0,
		ax = 0, ay = 0;
		
	var maxX = 0;
	var maxY = 0;
	var totalX = 0;
	var totalY = 0;

	var sphere = document.getElementById("sphere");

	if (window.DeviceMotionEvent != undefined) {
		window.ondevicemotion = function(e) {
			
			maxX = Math.max(Math.abs(event.acceleration.x), maxX);
			maxY = Math.max(Math.abs(event.acceleration.y), maxY);

		}

	} 

    //create a new instance of shake.js.
    var myShakeEvent = new Shake({
        threshold: 30
    });

    // start listening to device motion
    myShakeEvent.start();

    // register a shake event
    window.addEventListener('shake', shakeEventDidOccur, false);

    //shake event callback
    function shakeEventDidOccur () {
        var number = Math.ceil(randomDieNumber(maxX + maxY) * 6);
        $("#die-value").html(number);
    }

	function randomDieNumber(seed) {
	    var x = Math.sin(seed++) * 10000;
	    return x - Math.floor(x);
	}

});