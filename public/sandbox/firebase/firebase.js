$(function() {
	const MAX_IN_ROOM = 4;
	

    var fbDataRef = new Firebase('https://snl-room.firebaseio.com/');

    var roomUrl = 'https://snl-room.firebaseio.com/game/rooms';
    var playerUrl = 'https://snl-room.firebaseio.com/game/players';
    var moveUrl = 'https://snl-room.firebaseio.com/game/moves';
    // var authData = fbDataRef.getAuth();

    var playersRef = new Firebase(playerUrl);

    var roomId = "testRoom1";
    var playerId = "testPlayer1";
    var avatar = 1;
	var states = ["idle", "active"]
	var state = states[0];
    
    var currentRoom = {};
    var currentRoomPlayers = {};

    // register a new room
    function registerRoom(room) {
        // roomId = prompt('room id?', 'testRoom1');
        roomId = room;
        checkIfRoomExists(roomId, createRoomExistsCallback);
    }

    // room exist callback
    function createRoomExistsCallback(roomId, exists) {
        if (exists) {
            // check if i can join the room
            displayError("THE ROOM ALREADY EXISTS");
        } else {
            // create the room

            var roomsRef = new Firebase(roomUrl);
            roomsRef.child(roomId).set({
                name: roomId,
                open: true
            });

            displayMessage("ROOM " + roomId + " WAS CREATED SUCCESSFULLY");
        }
    }

    function joinBoardRoomExistsCallback(roomId, exists) {
 		if (exists) {
            // check if i can join the room
            var playerRef = new Firebase(playerUrl);

			playerRef.child(roomId).on('value', function(snapshot) {
				currentRoomPlayers = snapshot.val();
			});

            displayMessage("ROOM " + roomId + " WAS JOINED SUCCESSFULLY");
        } else {
        	displayError("THE ROOM DOESN'T EXIST");
        }
    }


	function joinRoomExistsCallback(roomId, exists) {
 		if (exists) {
            // check if i can join the room
			var player = $("#playerId").val();
			checkIfPlayerExistsInRoom(roomId, player);
        } else {
        	displayError("THE ROOM DOESN'T EXIST");
        }
    }

    // check to see if a room exists
    function checkIfRoomExists(roomId, callback) {
        var roomsRef = new Firebase(roomUrl);
        roomsRef.child(roomId).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            callback(roomId, exists);
        });
    }

    function registerPlayer(roomId) {
        playerId = prompt('player id?', 'testPlayer1');
        checkIfPlayerExistsInRoom(roomId, playerId);
    }

    // room exist callback
    function playerExistsCallback(roomId, playerId, exists) {
        if (exists) {
            // check if i can join the room
            displayError("SORRY " + playerId + " ALREADY EXISTS IN ROOM " + roomId);
        } else {

			var playerRef = new Firebase(playerUrl);

			playerRef.child(roomId).on('value', function(snapshot) {
				currentRoomPlayers = snapshot.val();
			});

			console.log();

			if (Object.keys(currentRoomPlayers).length < MAX_IN_ROOM) {
				// create the player
	            var playersRef = new Firebase(playerUrl);
	            playersRef.child(roomId).child(playerId).set({
	                name: playerId,
	                active: true,
	                avatar: 1,
	                position: 0
	            });

	            displayMessage("ROOM " + roomId + " JOINED SUCCESSFULLY AS " + playerId);
			} else {
				displayError("THERE ARE TOO MANY PEOPLE IN " + roomId)
			}
          	
            
            
        }
    }

    // check to see if a room exists
    function checkIfPlayerExistsInRoom(roomId, playerId) {
        // var playersRef = new Firebase(playerUrl);
        playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            playerExistsCallback(roomId, playerId, exists);
        });
    }

    function postRoll(playerId, rollAmount) {

        // var playersRef = new Firebase(playerUrl);
        playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
            var obj = snapshot.val();
            obj.position += rollAmount;
            playersRef.child(roomId).child(playerId).set(obj);
        });

    }

    function movePlayer(playerId, moveAmount) {
        playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
            var obj = snapshot.val();
            obj.position += moveAmount;
            playersRef.child(roomId).child(playerId).set(obj);
        });
    }

    function joinRoom(playerId) {

    }

    playersRef.on("child_changed", function(snapshot) {
        var changedPost = snapshot.val();

        // changedPost = all of the player positions in an object
        for (var i in changedPost) {
            console.log(changedPost[i].name + ' is at position ' + changedPost[i].position);
        }

    });

    function displayMessage(message) {
    	if ($("#message").hasClass("error")) $("#message").removeClass("error");

        $("#message").html(message);
    }

    function displayError(message) {
    	if (!$("#message").hasClass("error")) $("#message").addClass("error");
        $("#message").html(message);
    }

    // work with controls on page

    $("#room-create").on("click", function(e) {
    	e.preventDefault();
    	var room = $("#roomId").val();
    	if (room.trim().length < 4) {
    		displayError("ROOM NAME MUST BE LONGER THAT 3 CHARACTERS");
    		return;
    	} 
    	registerRoom(room);
    	// alert("Try to create the room " + room);
    });


    $("#room-join").on("click", function(e) {
    	e.preventDefault();
    	var room = $("#roomId").val();

    	// make sure the room is valid
    	if (room.trim().length < 4) {
    		displayError("ROOM NAME MUST BE VALID");
    		return;
    	}

    	var player = $("#playerId").val();

    	if (player.trim().length < 4) {
    		displayError("PLAYER NAME MUST BE VALID");
    		return;
    	}

    	checkIfRoomExists(room, joinRoomExistsCallback);

    });

    $("#room-join-board").on("click", function(e) {
    	e.preventDefault();
    	
    	var room = $("#roomId").val();
    	if (room.trim().length < 4) {
    		displayError("ROOM NAME MUST BE VALID");
    		return;
    	}
    	// if the room exists, then get the information from it, 
    	// but don't create a player
    	checkIfRoomExists(room, joinBoardRoomExistsCallback);
    });



    // registerRoom();
    // registerRoom();
    // registerPlayer("testRoom1");
    // postRoll("testPlayer1", 4);
    // movePlayer("testRoom1", "testPlayer1", -6);

});
