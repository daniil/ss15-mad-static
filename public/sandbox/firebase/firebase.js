$(function() {

	var fbDataRef = new Firebase('https://snl-room.firebaseio.com/');
  	// var authData = fbDataRef.getAuth();

  	var roomId = "testRoom1";
  	var playerId = "testPlayer1";
  	var avatar = 1;

  	var players = [];

  	function registerRoom(room) {

  		roomId = room;

	    fbDataRef.push({
	      action: "createRoom", 
	      room: roomId
	    });

  	}

  	function registerPlayer(playerId, avatar) {
  		
  		fbDataRef.child(roomId).push({
	      action: "registerPlayer", 
	      playerId: playerId,
	      avatar: avatar
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

  	// registerRoom("testRoom1");
  	// registerPlayer("testPlayer1", 1);
  	// postRoll("testRoom1", "testPlayer1", 4);
  	// movePlayer("testRoom1", "testPlayer1", -6);
  	// movePlayer("testRoom1", "testPlayer1", 4);

});