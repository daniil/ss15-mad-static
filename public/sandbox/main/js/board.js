(function() {
    var board = {

        tileArmLength: [8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1],
        player_index: 0,
        board_width: 9,
        board_height: 9,
        board_tiles: 0,
        targetIndex: 1,
        activePlayer: null,

        moveToEndOfArm: function() {

        },

        init: function() {
            
            console.log(this, "INITIALIZING BOARD");

            this.board_tiles = this.board_width * this.board_height

            for (var i = 0; i < this.board_tiles; i++) {

                $('#tile-' + this.pad(i + 1, 2)).on("click", function(event) {

                    board.targetIndex = Number($(this).attr("id").replace('tile-', ''));
                    board.moveBird();
                    
                });
            }

            this.getTileArm(this.player_index);
            this.setBirdToTile(this.player_index);

        },

        addPlayer: function(playerId, avatar) {

            var playerDiv = $("<div id='" + playerId + "' class='" + avatar + "'>");
            
            $("#players").append(playerDiv);

            $('#' + playerId).sprite({
                fps: 12,
                no_of_frames: 3
            });

            $('#' + playerId).on("click", function(event) {
                $(this).spToggle();
            });
        },

        movePlayer: function(playerId, targetIndex) {

            this.activePlayer = playerId;

            this.moveBird();
        },

        goToEnd: function() {

            var tile_tally = 0;

            for (var i in this.tileArmLength) {

                // console.log(player_index, i);
                if (tile_tally > this.player_index) {

                    // tile_tally -= tileArmLength[i];
                    var tile_end = tile_tally;
                    // console.log("Result", i, player_index, tile_end - 1);
                    if (this.player_index == tile_end) {
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
            tile += 1;
            //$("#bird").offset($("#tile-"+pad(tile, 2)).offset());
            TweenMax.to($("#" + this.activePlayer), 1, {
                left: $("#tile-" + this.pad(tile, 2)).offset().left,
                top: $("#tile-" + this.pad(tile, 2)).offset().top,
                ease: Linear.easeOut,
                onComplete: this.moveBird
            });
        },

        moveBird: function() {

            if (board.targetIndex - 1 == board.player_index) {
                return;
            }
            
            if (board.getTileArm(board.player_index) == board.getTileArm(board.targetIndex)) {
                console.log("Go Directly");
                board.setBirdToTile(board.targetIndex - 1);
            } else {
                console.log("Go to end");
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

