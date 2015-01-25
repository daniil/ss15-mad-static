(function() {
    var dice = {

        maxX: 0,
        maxY: 0,
        totalX: 0,
        totalY: 0,

        enableRoll: function() {
            if (window.DeviceMotionEvent != undefined) {
                window.ondevicemotion = function(e) {

                    dice.maxX = Math.max(Math.abs(event.acceleration.x), dice.maxX);
                    dice.maxY = Math.max(Math.abs(event.acceleration.y), dice.maxY);
                }
            } else {
                // TODO: build alternate to shake
                alert("SHAKING NOT SUPPORTED ON YOUR BROWSER");
            }

            //create a new instance of shake.js.
            var myShakeEvent = new Shake({
                threshold: 30
            });

            // start listening to device motion
            myShakeEvent.start();

            // register a shake event
            window.addEventListener('shake', dice.shakeEventDidOccur, false);

        },

        //shake event callback
        shakeEventDidOccur: function() {
            var number = Math.ceil(dice.randomDieNumber(dice.maxX + dice.maxY) * 6);
            game.displayMessage("you rolled a " + number);
            game.rollDice(number);
            dice.disableRoll();
        },

        disableRoll: function() {
        	try {
        		window.removeEventListener('shake', dice.shakeEventDidOccur, false);
           		window.ondevicemotion = null;	
        	} catch (e) {
        		console.log("error disable roll");
        	}

        },

        randomDieNumber: function(seed) {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }
    }

    window.dice = dice;

})();
