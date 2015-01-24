(function() {
    var fb = {

        MAX_IN_ROOM: 4,

        fbDataRef: new Firebase('https://snl-room.firebaseio.com/'),

        roomUrl: 'https://snl-room.firebaseio.com/game/rooms',
        playerUrl: 'https://snl-room.firebaseio.com/game/players',
        moveUrl: 'https://snl-room.firebaseio.com/game/moves',

        playersRef: null, //new Firebase(this.playerUrl),

        roomId: "testRoom1",
        playerId: "testPlayer1",
        avatar: 1,
        // states: ["idle", "active"],
        state: "idle",

        currentRoom: {},
        currentRoomPlayers: {},

        // register a new room
        registerRoom: function(room) {
            // roomId = prompt('room id?', 'testRoom1');
            roomId = room;
            this.checkIfRoomExists(roomId, this.createRoomExistsCallback);
        },

        // room exist callback
        createRoomExistsCallback: function(roomId, exists) {
            if (exists) {
                // check if i can join the room
                game.displayError("THE ROOM ALREADY EXISTS");
            } else {
                // create the room

                var roomsRef = new Firebase(this.roomUrl);
                roomsRef.child(roomId).set({
                    name: roomId,
                    open: true
                });

                game.displayMessage("ROOM " + roomId + " WAS CREATED SUCCESSFULLY");
            }
        },

        joinBoardRoomExistsCallback: function(roomId, exists) {
            if (exists) {
                // check if i can join the room
                
                fb.playerRef = new Firebase(fb.playerUrl + "/" + roomId);

                fb.playerRef.on('value', function(snapshot) {
                    currentRoomPlayers = snapshot.val();
                });

                game.displayMessage("ROOM " + roomId + " WAS JOINED SUCCESSFULLY");
            } else {
                game.displayError("THE ROOM DOESN'T EXIST");
            }
        },


        joinRoomExistsCallback: function(roomId, exists) {
            if (exists) {
                // check if i can join the room
                var player = $("#playerId").val();
                fb.checkIfPlayerExistsInRoom(roomId, player);
            } else {
                game.displayError("THE ROOM DOESN'T EXIST");
            }
        },

        // check to see if a room exists
        checkIfRoomExists: function(roomId, callback) {
            var roomsRef = new Firebase(this.roomUrl);
            roomsRef.child(roomId).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                callback(roomId, exists);
            });
        },

        registerPlayer: function(roomId) {
            playerId = prompt('player id?', 'testPlayer1');
            checkIfPlayerExistsInRoom(roomId, playerId);
        },

        // room exist callback
        playerExistsCallback: function(roomId, playerId, exists) {
            
            if (exists) {
                // check if i can join the room
                game.displayError("SORRY " + playerId + " ALREADY EXISTS IN ROOM " + roomId);
            } else {

                this.playerRef = new Firebase(this.playerUrl + "/" + roomId);

                // setup the game level variables
                this.playerRef.on('value', function(snapshot) {
                    game.activePlayers = snapshot.val();
                });

                game.playerId = playerId;
                game.roomId = roomId;

                if (Object.keys(game.activePlayers).length < this.MAX_IN_ROOM) {
                    // create the player

                    // this.playersRef = new Firebase(this.playerUrl + "/" + roomId);
                    this.playersRef.child(playerId).set({
                        name: playerId,
                        active: true,
                        avatar: 1,
                        position: 0
                    });

                    board.init();

                    game.displayMessage("ROOM " + roomId + " JOINED SUCCESSFULLY AS " + playerId);
                } else {
                    game.displayError("THERE ARE TOO MANY PEOPLE IN " + roomId)
                }

            }
        },

        // check to see if a room exists
        checkIfPlayerExistsInRoom: function(roomId, playerId) {
            this.playersRef = new Firebase(this.playerUrl + "/" + roomId);
            
            this.playersRef.child(playerId).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                fb.playerExistsCallback(roomId, playerId, exists);
            });
        },

        postRoll: function(playerId, rollAmount) {

            // var playersRef = new Firebase(playerUrl);
            this.playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
                var obj = snapshot.val();
                obj.position += rollAmount;
                playersRef.child(roomId).child(playerId).set(obj);
            });

        },

        movePlayer: function(playerId, moveAmount) {
            this.playersRef.child(roomId).child(playerId).once('value', function(snapshot) {
                var obj = snapshot.val();
                obj.position += moveAmount;
                playersRef.child(roomId).child(playerId).set(obj);
            });
        },

        joinRoom: function(playerId) {

        }
        
        // work with controls on page


        // registerRoom();
        // registerRoom();
        // registerPlayer("testRoom1");
        // postRoll("testPlayer1", 4);
        // movePlayer("testRoom1", "testPlayer1", -6);

    };

    window.fb = fb;

})();
