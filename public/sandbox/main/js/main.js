(function() {
    var game = { 
    	// manage all the active game data
    	playerId: "",
    	roomId: "",
    	activePlayers: {},

    	initMainMenu: function() {

    		$("#game-board").hide();

    		$("#room-create").on("click", function(e) {
	            e.preventDefault();
	            var room = $("#roomId").val();
	            if (room.trim().length < 4) {
	                this.displayError("ROOM NAME MUST BE LONGER THAT 3 CHARACTERS");
	                return;
	            }
	            fb.registerRoom(room);
	            // alert("Try to create the room " + room);
	        });


	        $("#room-join").on("click", function(e) {
	            e.preventDefault();
	            var room = $("#roomId").val();

	            // make sure the room is valid
	            if (room.trim().length < 4) {
	                game.displayError("ROOM NAME MUST BE VALID");
	                return;
	            }

	            var player = $("#playerId").val();

	            if (player.trim().length < 4) {
	                game.displayError("PLAYER NAME MUST BE VALID");
	                return;
	            }

	            fb.checkIfRoomExists(room, fb.joinRoomExistsCallback);

	        });

	        $("#room-join-board").on("click", function(e) {
	            e.preventDefault();

	            var room = $("#roomId").val();
	            if (room.trim().length < 4) {
	                this.displayError("ROOM NAME MUST BE VALID");
	                return;
	            }
	            // if the room exists, then get the information from it, 
	            // but don't create a player
	            fb.checkIfRoomExists(room, fb.joinBoardRoomExistsCallback);
	        });

    	},

    	playerChanged: function(data) {
    		// var playerId = data.name;
    		board.movePlayer(data.name, data.position)
    	},

        playerAdded: function(data) {
            this.activePlayers.push(data);
            for (var i in this.activePlayers) {
                var player = this.activePlayers[i]; 
                var playerInfoDiv = $("<li id='legend-" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");
                $("#activePlayers").append(playerInfoDiv);

                board.addPlayer(player.name, "avatar" + player.avatar, player.position);
                // this.playerChanged(player);
            }
        },

    	showPlayersInRoom: function() {
    		
			this.initGame();
            
            $("#activePlayers").empty();

    		for (var i in this.activePlayers) {
    			var player = this.activePlayers[i]; 
    			var playerInfoDiv = $("<li id='legend-" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");
    			$("#activePlayers").append(playerInfoDiv);

    			board.addPlayer(player.name, "avatar" + player.avatar, player.position);
    			// this.playerChanged(player);
    		}
    		
    	},

    	updateTurn: function(data) {
            // console.log("ASDASDAS", data)
    		this.updateOrder(data);

    		var player = data.order[data.currentPlayerTurn];
    		if (player == game.playerId) {
    			alert('it is your turn ' + game.playerId);
                dice.enableRoll();
    		} else {
                dice.disableRoll();
            }
    	},

    	updateOrder: function(data) {
            // console.log("BASDASDAS", data)
    		$("#activePlayers ul li.active").removeClass("active");
    		$("#legend-" + data.order[data.currentPlayerTurn]).addClass("active");
    	},

    	initGame: function() {
    		
    		board.init();

    		$("#main-menu").hide();
    		$("#game-board").show();

    	},

    	displayMessage: function(message) {
            if ($("#message").hasClass("error")) $("#message").removeClass("error");
            $("#message").html(message);
        },

        displayError: function(message) {
            if (!$("#message").hasClass("error")) $("#message").addClass("error");
            $("#message").html(message);
        }



    };

    window.game = game;

})();
