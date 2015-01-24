$(function() {

    var fbDataRef = new Firebase('https://snl-room.firebaseio.com/');

    var roomUrl = 'https://snl-room.firebaseio.com/game/rooms';
    var playerUrl = 'https://snl-room.firebaseio.com/game/players';
    var moveUrl = 'https://snl-room.firebaseio.com/game/moves';
    // var authData = fbDataRef.getAuth();

    var playersRef = new Firebase(playerUrl);

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
            roomsRef.child(roomId).set({
                name: roomId,
                open: true
            });
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
            playersRef.child(roomId).child(playerId).set({
                name: playerId,
                active: true,
                avatar: 1,
                position: 0
            });
            alert('player ' + playerId + ' created');
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

    playersRef.on("child_changed", function(snapshot) {
        var changedPost = snapshot.val();

        // changedPost = all of the player positions in an object
        for (var i in changedPost) {
            console.log(changedPost[i].name + ' is at position ' + changedPost[i].position);
        }

    });

    // registerRoom();
    // registerRoom();
    // registerPlayer("testRoom1");
    postRoll("testPlayer1", 4);
    // movePlayer("testRoom1", "testPlayer1", -6);
    // movePlayer("testRoom1", "testPlayer1", 4);

});
