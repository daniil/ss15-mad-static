(function() {
    var dice = {

        maxX: 0,
        maxY: 0,
        totalX: 0,
        totalY: 0,

        enableRoll: function() {
            if (window.DeviceMotionEvent != undefined) {
                window.ondevicemotion = function(e) {

                    maxX = Math.max(Math.abs(event.acceleration.x), maxX);
                    maxY = Math.max(Math.abs(event.acceleration.y), maxY);
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
            var number = Math.ceil(this.randomDieNumber(this.maxX + this.maxY) * 6);
            $("#die-value").html(number);

            window.removeEventListener('shake', dice.shakeEventDidOccur, false);
            window.ondevicemotion = null;

        },

        randomDieNumber: function(seed) {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }
    }

    window.dice = dice;

})();
