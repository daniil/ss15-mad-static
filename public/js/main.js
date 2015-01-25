(function() {
    var game = { 
    	// manage all the active game data
    	playerId: "",
    	roomId: "",
    	activePlayers: {},

        gameIsRunning: false,
        dialog: null,

        init: function() {
            this.showMainMenu();
        },

    	showMainMenu: function() {

    		$("#room-create").on("click", function(e) {
	            e.preventDefault();

	            var room = $("#roomId").val();

	            if (room.trim().length < 4) {
	                game.displayError("ROOM NAME MUST BE LONGER THAT 3 CHARACTERS");
	                return;
	            }

	            fb.registerRoom(room);
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

        initBoard: function() {
            
            if (this.gameIsRunning) return;

            $("#main-menu").fadeOut();
            $("#game-board").fadeIn();

            this.displayDialog("waiting");

            $("#waiting .cta").on("click", function(e) {
                game.hideDialog("waiting");
                game.startGame();
            });

        },

        startGame: function() {
            if (this.gameIsRunning) return;
            this.gameIsRunning = true;

            // close the game off to others
            fb.closeGame();

            board.init();
            challenges.init();

            fb.initTurns();

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

            }
        },

    	showPlayersInRoom: function() {
    		
            $("#activePlayers,#waitingPlayers").empty();

    		for (var i in this.activePlayers) {
    			var player = this.activePlayers[i]; 
    			var playerInfoDiv = $("<li id='legend-" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");

    			$("#activePlayers").append(playerInfoDiv);
                $("#waitingPlayers").append(playerInfoDiv.clone());
    		}
    	   
    	},

    	updateTurn: function(data) {
            // console.log("ASDASDAS", data)
    		this.updateOrder(data);

    		var player = data.order[data.currentPlayerTurn];
    		if (player == game.playerId) {
    			setTimeout(function() { game.displayDialog('roll-dice'); }, 500);
                dice.enableRoll();
    		} else {
                // TODO: it is someone else's turn, make sure that they can go
                dice.disableRoll();
            }

    	},

    	updateOrder: function(data) {
            // console.log("BASDASDAS", data)
    		$("#activePlayers ul li.active").removeClass("active");
    		$("#legend-" + data.order[data.currentPlayerTurn]).addClass("active");
    	},

        rollDice: function(value) {
            fb.postRoll(this.playerId, value);
        },

        rollComplete: function() {
            fb.nextTurn(this.playerId);
        },

        turnComplete: function(playersTurn) {
            // console.log(playersTurn, this.playerId);
            if (playersTurn == this.playerId) {
                fb.nextTurn(this.playerId);
            }
        },

        landedOnSnake: function() {
            $("#challenge-opponent-snake ul.challengePlayers").empty();

            for (var i in this.activePlayers) {
                var player = this.activePlayers[i]; 
                if (player.name != game.playerId) {
                    var playerInfoDiv = $("<li id='challenge-" + player.name + "' class='challenge' data-name='" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");

                    $("#challenge-opponent-snake ul.challengePlayers").append(playerInfoDiv);

                    $("#challenge-opponent-snake ul.challengePlayers li").on("click", game.challengeMiniGame);
                }
            }

            this.displayDialog("challenge-opponent-snake");
        },

        landedOnLadder: function() {
            $("#challenge-opponent-ladder ul.challengePlayers").empty();

            for (var i in this.activePlayers) {
                var player = this.activePlayers[i]; 
                if (player.name != game.playerId) {
                    var playerInfoDiv = $("<li id='challenge-" + player.name + "' class='challenge' data-name='" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");
                    $("#challenge-opponent-ladder ul.challengePlayers").append(playerInfoDiv);
                    $("#challenge-opponent-ladder ul.challengePlayers li").on("click", game.challengeMiniGame);    
                }
            }

            this.displayDialog("challenge-opponent-ladder");
        },

        challengeMiniGame: function(e) {
            game.challengePlayer(game.playerId, $(e.currentTarget).data("name"));
        },

        challengePlayer: function(player1Id, player2Id) {
            challenges.startChallenge(player1Id, player2Id);
        },

        displayDialog: function(dialog) {
            $("#"+dialog+",#dialogs").fadeIn("fast");
        },

        hideDialog: function(dialog) {
            $("#"+dialog+",#dialogs").fadeOut("slow");
        },

    	displayMessage: function(message) {
            if ($("#message").hasClass("error")) $("#message").removeClass("error");
            $("#message>p").html(message);

            $("#message,#non-interactive-dialogs").fadeIn("fast");
            setTimeout(function() { $("#message,#non-interactive-dialogs").fadeOut("slow"); }, 3000);
        },

        displayError: function(message) {
            if (!$("#message").hasClass("error")) $("#message").addClass("error");
            $("#message>p").html(message);

            $("#message,#non-interactive-dialogs").fadeIn("fast");
            setTimeout(function() { $("#message,#non-interactive-dialogs").fadeOut("slow"); }, 3000);
        }

    };

    window.game = game;

})();
