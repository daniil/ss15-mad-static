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

			if(window.mobilecheck()){
				$("#board-container" ).on("scroll",function(){
					$this = $(this);
					var $playersContainer = $("#players-container");
					$playersContainer.scrollLeft($this.scrollLeft());
					$playersContainer.scrollTop($this.scrollTop());
				});
			}

            this.displayDialog("waiting");

            $("#waiting .cta").on("click", function(e) {

                if (Object.keys(game.activePlayers).length < 2) {
                    // return alert("get some friends");
                }

                game.hideDialog("waiting");
                game.startGame();
            });

            $("#current-room").html("current room: " + game.roomId);

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
            // console.log("ROLL DICE PRE")
            // if (board.activePlayer !== this.playerId) return;
            // console.log("ROLL DICE POST")
            fb.postRoll(this.playerId, value);
        },

        rollComplete: function() {
            fb.nextTurn(this.playerId);
        },

        turnComplete: function(playersTurn) {

			if(mobilecheck()){
				if ($("#" + this.playerId ).offset().left > 0) {
					$("#board-container" ).scrollLeft($("#" + this.playerId ).offset().left - 40);
				} else {
					$("#board-container" ).scrollLeft($("#" + this.playerId ).offset().left);
				}

				$("#board-container" ).scrollTop($("#" + this.playerId ).offset().top);
			}
            // console.log(playersTurn, this.playerId);

			if (playersTurn == this.playerId) {

                fb.nextTurn(this.playerId);
            }
        },

        landedOnSnake: function(pointValue) {
            if (board.activePlayer !== game.playerId) return;

            $("#challenge-opponent-snake ul.challengePlayers").empty();

            for (var i in this.activePlayers) {
                var player = this.activePlayers[i]; 
                if (player.name != game.playerId) {
                    var playerInfoDiv = $("<li id='challenge-" + player.name + "' class='challenge' data-points='" + pointValue + "' data-name='" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");
                    $("#challenge-opponent-snake ul.challengePlayers").append(playerInfoDiv);
                    $("#challenge-opponent-snake ul.challengePlayers li").on("click", game.challengeMiniGame);
                }
            }

            this.displayDialog("challenge-opponent-snake");
        },

        landedOnLadder: function(pointValue) {
            if (board.activePlayer !== game.playerId) return;
            $("#challenge-opponent-ladder ul.challengePlayers").empty();

            for (var i in this.activePlayers) {
                var player = this.activePlayers[i]; 
                if (player.name != game.playerId) {
                    var playerInfoDiv = $("<li id='challenge-" + player.name + "' class='challenge' data-points='" + pointValue + "' data-name='" + player.name + "'>" + player.name + "<div class='avatar" + player.avatar + "'></div></li>");
                    $("#challenge-opponent-ladder ul.challengePlayers").append(playerInfoDiv);
                    $("#challenge-opponent-ladder ul.challengePlayers li").on("click", game.challengeMiniGame);    
                }
            }

            this.displayDialog("challenge-opponent-ladder");
        },

        gameOver: function() {
            console.log("we should do something when the game is over");
        },

        challengeMiniGame: function(e) {
            game.hideDialog("challenge-opponent-ladder");  
            game.hideDialog("challenge-opponent-snake");  
            game.challengePlayer(game.playerId, $(e.currentTarget).data("name"), $(e.currentTarget).data("points"));
        },

        challengePlayer: function(player1Id, player2Id, pointValue) {
            challenges.startChallenge(player1Id, player2Id, pointValue);
        },

        miniChallengeFinished: function(gameResults) {
            // this only does something if you are the one who is effected by the points
            if (board.activePlayer != game.playerId) return;
            // console.log(gameResults);
            var players = Object.getOwnPropertyNames(gameResults.players);
            var me = game.playerId;
            var you = players[1 - players.indexOf(game.playerId)];

            var totalScore = gameResults.players[me].score + gameResults.players[you].score;
            var ratio = 0; // this stays if you are bad at the game

            if (gameResults.players[me].score !== 0) {
                // improve the ration
                ratio = gameResults.players[me].score / totalScore;
            }

            var spacesMoved = Math.round(gameResults.points * ratio) + (ratio === 0) ? 1 : 0;

            console.log("THIS IS THE END, MY SO CALLED FRIEND, THE END", spacesMoved);
            fb.postRoll(this.playerId, spacesMoved);

            challenges.resetChallenge();
        },

        displayDialog: function(dialog) {
            //$("#"+dialog+",#dialogs" ).removeClass("bounceOut").addClass("animated");
			$("#dialogs" ).css("opacity",1);
			$("#" + dialog ).show();
			$("#" + dialog ).removeClass("bounceOut" ).addClass("animated bounceIn");
        },

        hideDialog: function(dialog) {
            //$("#"+dialog+",#dialogs" ).addClass("animated bounceOut");

			$("#" + dialog).removeClass("bounceIn" ).addClass(" bounceOut");
			$("#" + dialog ).hide();
			$("#dialogs" ).css("opacity",0);

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
