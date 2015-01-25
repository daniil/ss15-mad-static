(function() {
    var dice = {

        maxX: 0,
        maxY: 0,
        totalX: 0,
        totalY: 0,

        enableRoll: function() {

            // TODO: adjust the content of the window depending on the capabilities of the device

            if (window.DeviceMotionEvent != undefined) {
                window.ondevicemotion = function(e) {
                    dice.maxX = Math.max(Math.abs(event.acceleration.x), dice.maxX);
                    dice.maxY = Math.max(Math.abs(event.acceleration.y), dice.maxY);
                }

                 //create a new instance of shake.js.
                var myShakeEvent = new Shake({
                    threshold: 30
                });

                // start listening to device motion
                myShakeEvent.start();

                // register a shake event
                window.addEventListener('shake', dice.shakeEventDidOccur, false);
            }

            $("#roll").on("click", dice.manualShake);
        },

        manualShake: function() {
            dice.maxX = Math.random() * 40;
            dice.maxY = Math.random() * 40;
                
            dice.shakeEventDidOccur();
        },

        //shake event callback
        shakeEventDidOccur: function() {
            var number = Math.ceil(dice.randomDieNumber(dice.maxX + dice.maxY) * 6);
            game.displayMessage("you rolled a " + number);
            game.rollDice(number);

            dice.disableRoll();
        },

        disableRoll: function() {
            game.hideDialog('roll-dice');
        	try {
                $("#roll").off("click", dice.manualShake);
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
