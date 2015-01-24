$(function() {

	var fbDataRef = new Firebase('https://snl-room.firebaseio.com/');
  	// var authData = fbDataRef.getAuth();

  	function registerRoom(roomId) {

	    fbDataRef.push({
	      action: "createRoom", 
	      room: roomId
	    });

  	}

  	function registerPlayer(roomId, playerId, avatar) {
  		
  		fbDataRef.child(roomId).push({
	      action: "registerPlayer", 
	      playerId: playerId,
	      avatar: avatar
	    });

  	}

  	function postRoll(roomId, playerId, rollAmount) {
  		fbDataRef.child(roomId).child(playerId).push({
	      action: "roll", 
	      amount: rollAmount
	    });
  	}

  	function movePlayer(roomId, playerId, moveAmount) {
		fbDataRef.child(roomId).child(playerId).push({
	      action: "move", 
	      amount: moveAmount
	    });
  	}

  	

  	// registerRoom("testRoom1");
  	// registerPlayer("testRoom1", "testPlayer1", 1);
  	// postRoll("testRoom1", "testPlayer1", 4);
  	// movePlayer("testRoom1", "testPlayer1", -6);
  	// movePlayer("testRoom1", "testPlayer1", 4);

});