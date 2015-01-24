$(function() {

	var fbDataRef = new Firebase('https://snl-room.firebaseio.com/');

	var roomUrl = 'https://snl-room.firebaseio.com/game/rooms';
	var playerUrl = 'https://snl-room.firebaseio.com/game/players';
	var moveUrl = 'https://snl-room.firebaseio.com/game/moves';
  	// var authData = fbDataRef.getAuth();

  	var roomId = "testRoom1";
  	var playerId = "testPlayer1";
  	var avatar = 1;

  	// register a new room
  	function registerRoom() {
        roomId = prompt('room id?', 'testRoom1');
        checkIfRoomExists(roomId);
  	}

  	// room exist callback
  	function roomExistsCallback(roomId, exists) {
        if (exists) {
        	// check if i can join the room
          	alert('sorry, ' + roomId + ' exists already!');
        } else {
        	// create the room
        	var roomsRef = new Firebase(roomUrl);
        	roomsRef.child(roomId).set({name: roomId, open: true });
        	alert('room ' + roomId + ' created');
        }
    }

    // check to see if a room exists
    function checkIfRoomExists(roomId) {
		var roomsRef = new Firebase(roomUrl);
		roomsRef.child(roomId).once('value', function(snapshot) {
			var exists = (snapshot.val() !== null);
			roomExistsCallback(roomId, exists);
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
          	alert('sorry, ' + playerId + ' exists already in room ' + roomId + '!');
        } else {
        	// create the room
        	var playersRef = new Firebase(playerUrl);
        	playersRef.child(roomId).child(playerId).set({name: playerId, active: true, avatar: 1 });
        	alert('player ' + playerId + ' created');
        }
    }

    // check to see if a room exists
    function checkIfPlayerExistsInRoom(roomId, playerId) {
		var playersRef = new Firebase(playerUrl);
		playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
			var exists = (snapshot.val() !== null);
			playerExistsCallback(roomId, playerId, exists);
		});
	}

  	function postRoll(playerId, rollAmount) {
  		fbDataRef.child(roomId).child(playerId).set({

	      action: "postion", 
	      amount: rollAmount
	    });
  	}

  	function movePlayer(playerId, moveAmount) {
		fbDataRef.child(roomId).push({
	      action: "move", 
	      playerId: playerId,
	      amount: moveAmount
	    });
  	}

  	function updatePlayerPosition(playerId) {

  	}

	fbDataRef.child(roomId).on("child_added", function(snapshot) {
		console.log("ADDED", snapshot);
	});
	
	fbDataRef.child(roomId).on("child_changed", function(snapshot) {
		console.log("CHANGED", snapshot);
	});

	fbDataRef.child(roomId).on("child_removed", function(snapshot) {
		console.log("REMOVED", snapshot);
	});
// registerRoom();
  	registerRoom();
  	registerPlayer("testRoom1");
  	// postRoll("testRoom1", "testPlayer1", 4);
  	// movePlayer("testRoom1", "testPlayer1", -6);
  	// movePlayer("testRoom1", "testPlayer1", 4);

});