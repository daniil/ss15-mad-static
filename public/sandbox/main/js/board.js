(function() {
    var board = {

        tileArmLength: [8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1],
        player_index: 0,
        board_width: 9,
        board_height: 9,
        board_tiles: 0,
        targetIndex: 1,
        activePlayer: null,

        ladders: [ 
            { start: 6, length: 10 }, 
            { start: 14, length: 6 }, 
            { start: 24, length: 15 }, 
            { start: 32, length: 4 }, 
            { start: 40, length: 10 }, 
            { start: 46, length: 3 }, 
            { start: 60, length: 10 }, 
            { start: 68, length: 7 }],

        snakes: [ 
            { start: 10, length: 8 }, 
            { start: 18, length: 5 }, 
            { start: 25, length: 15 }, 
            { start: 38, length: 4 }, 
            { start: 48, length: 10 }, 
            { start: 56, length: 6 }, 
            { start: 69, length: 10 }, 
            { start: 80, length: 7 }],


        moveToEndOfArm: function() {

        },

        init: function() {
            
            console.log(this, "INITIALIZING BOARD");

            this.board_tiles = this.board_width * this.board_height

            for (var i in this.snakes) {
                // add a reference to the starting
                var tile = $("#tile-" + this.pad(this.snakes[i].start, 2));
                var snakeDiv = $("<div class='snake' data-value='" + this.snakes[i].length + "'>o shit.. a snake x" + this.snakes[i].length + "</div>");
                // console.log(tile);
                tile.append(snakeDiv);
                tile.addClass('snake-tile');
            }

            for (var i in this.ladders) {
                // add a reference to the starting
                // add a reference to the starting
                var tile = $("#tile-" + this.pad(this.ladders[i].start, 2));
                var ladderDiv = $("<div class='ladder' data-value='" + this.ladders[i].length + "'>thank jeebus! a ladder x" + this.ladders[i].length + "</div>");
                tile.append(ladderDiv);
                tile.addClass('ladder-tile');
            }
        },

        addPlayer: function(playerId, avatar, position) {

            var playerDiv = $("<div data-index='" + position + "' id='" + playerId + "' class='" + avatar + "'>");
            
            $("#players").append(playerDiv);

            $('#' + playerId).sprite({
                fps: 12,
                no_of_frames: 3
            });

            $('#' + playerId).on("click", function(event) {
                $(this).spToggle();
            });

            this.getTileArm(position);
            this.setBirdToTile(position);
            
            var paddedTile = this.pad(position+ 1, 2) ;

            $('#' + playerId).css("left", $("#tile-" + paddedTile).offset().left);
            $('#' + playerId).css("top", $("#tile-" + paddedTile).offset().top);

        },

        movePlayer: function(playerId, targetIndex) {

            this.activePlayer = playerId;
            this.targetIndex = targetIndex;

            this.moveBird();
        },

        goToEnd: function() {

            var pindex = $("#" + this.activePlayer).data("index");

            var tile_tally = 0;
            
            for (var i in this.tileArmLength) {

                // console.log(player_index, i);
                // if (tile_tally > this.player_index) {
                if (tile_tally > pindex) {

                    // tile_tally -= tileArmLength[i];
                    var tile_end = tile_tally;
                    // console.log("Result", i, player_index, tile_end - 1);
                    if (pindex == tile_end) {
                    // if (this.player_index == tile_end) {
                        tile_end += this.tileArmLength[i];
                    }

                    this.setBirdToTile(tile_end);

                    break;
                }
                tile_tally += this.tileArmLength[i];
            }
        },

        setBirdToTile: function(tile) {

            this.player_index = tile;
            $("#" + this.activePlayer).data("index", tile);
            // console.log($("#" + this.activePlayer).data("index"));
            tile += 1;
            
            TweenMax.to($("#" + this.activePlayer), 1, {
                left: $("#tile-" + this.pad(tile, 2)).offset().left,
                top: $("#tile-" + this.pad(tile, 2)).offset().top,
                ease: Linear.easeOut,
                onComplete: this.moveBird
            });
        },

        moveBird: function() {
            var pindex = $("#" + board.activePlayer).data("index");

            if (board.targetIndex - 1 == pindex) {
                // console.log("complete", pindex, board.pad(pindex, 2));
                // console.log($("#tile-" + board.pad(pindex + 1, 2)));
                if ($("#tile-" + board.pad(pindex + 1, 2)).hasClass("ladder-tile"))  {
                    alert("landed on a ladder");
                } else if ($("#tile-" + board.pad(pindex + 1, 2)).hasClass("snake-tile"))  {
                    alert("landed on a snake");
                }
                game.turnComplete(board.activePlayer);
                return;
            }
            
            if (board.getTileArm(pindex) == board.getTileArm(board.targetIndex)) {
                // console.log("Go Directly");
                board.setBirdToTile(board.targetIndex - 1);
            } else {
                // console.log("Go to end");
                board.goToEnd();
            }
        },

        getTileArm: function(tileIndex) {

            var tile_tally = 0;

            for (var i in this.tileArmLength) {
                if (tile_tally > tileIndex) {
                    return (i - 1);
                    break;
                }

                tile_tally += this.tileArmLength[i];

            }
        },

        isPlayerOnArm: function() {

            var tile_tally = 0;

            for (var i in this.tileArmLength) {

                tile_tally += this.tileArmLength[i];

                if (tile_tally > this.targetIndex) {
                    var tile_end = tile_tally;

                    if (tile_end >= this.targetIndex) {
                        console.log("same arm");
                    }
                    tile_tally -= this.tileArmLength[i];
                    // console.log(tile_end);
                    //setBirdToTile(tile_end-1);
                    break;
                }
            }
        },

        pad: function(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
    }

    window.board = board;

})();

