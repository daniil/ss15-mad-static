$(function() {

	var tileArmLength = [8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1];
    var player_index = 0;
    var board_width = 9;
    var board_height = 9;
    var board_tiles = board_width * board_height;
	var targetIndex = 1;

    function moveToEndOfArm() {

    }

    function init() {

        $('#bird').sprite({
            fps: 12,
            no_of_frames: 3
        });
        
        $('#bird').on("click", function(event) {
            $('#bird').spToggle();
        });
        
        for (var i = 0; i < board_tiles; i++) {
            $('#tile-' + pad(i + 1, 2)).on("click", function(event) {
                targetIndex = Number(this.id.replace('tile-', ''));
                moveBird();
                //setBirdToTile(Number(this.id.replace('tile-','')-1));
            });
        }

        getTileArm(player_index);
        setBirdToTile(player_index);

    }
    
    function goToEnd() {

        var tile_tally = 0;
        
        for (var i in tileArmLength) {
            
            // console.log(player_index, i);
            if (tile_tally > player_index) {

                // tile_tally -= tileArmLength[i];
                tile_end = tile_tally;
                // console.log("Result", i, player_index, tile_end - 1);
                if (player_index == tile_end) {
                    tile_end += tileArmLength[i];
                }

                setBirdToTile(tile_end);

                break;
            }
            tile_tally += tileArmLength[i];
        }
    }

    function setBirdToTile(tile) {
    	
        player_index = tile;
        tile += 1;
        //$("#bird").offset($("#tile-"+pad(tile, 2)).offset());
        TweenMax.to($("#bird"), 1, {
            left: $("#tile-" + pad(tile, 2)).offset().left,
            top: $("#tile-" + pad(tile, 2)).offset().top,
            ease: Linear.easeOut,
            onComplete: moveBird
        });
    }

    

    function moveBird() {
        
        if (targetIndex - 1 == player_index) {
            return;
        }

        if (getTileArm(player_index) == getTileArm(targetIndex)) {
            console.log("Go Directly");
            setBirdToTile(targetIndex - 1);
        } else {
            console.log("Go to end");
            goToEnd();
        }
    }
   
    function getTileArm(tileIndex) {

        tile_tally = 0;
        
        for (var i in tileArmLength) {
            if (tile_tally > tileIndex) {
                return (i - 1);
                break;
            }

            tile_tally += tileArmLength[i];

        }
    }

    function isPlayerOnArm() {

        for (var i in tileArmLength) {

            tile_tally += tileArmLength[i];
            
            if (tile_tally > targetIndex) {
                tile_end = tile_tally;

                if (tile_end >= targetIndex) {
                    console.log("same arm");
                }
                tile_tally -= tileArmLength[i];
                console.log(tile_end);
                //setBirdToTile(tile_end-1);
                break;
            }
        }
    }

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    init();
});
