(function() {
    var fb = {

        MAX_IN_ROOM: 4,

        fbDataRef: new Firebase('https://snl-room.firebaseio.com/'),

        roomUrl: 'https://snl-room.firebaseio.com/game/rooms',
        playerUrl: 'https://snl-room.firebaseio.com/game/players',
        moveUrl: 'https://snl-room.firebaseio.com/game/moves',
        challengeUrl: 'https://snl-room.firebaseio.com/game/challenges',

        playersRef: null, //new Firebase(this.playerUrl),
        roomsRef: null,

        roomId: "testRoom1",
        playerId: "testPlayer1",
        avatar: 1,
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

                var roomsRef = new Firebase(fb.roomUrl);
                roomsRef.child(roomId).set({
                    name: roomId,
                    open: true,
                    order: [],
                    currentPlayerTurn: 0
                });

                game.displayMessage("ROOM " + roomId + " WAS CREATED SUCCESSFULLY");
            }
        },

        joinBoardRoomExistsCallback: function(roomId, exists) {
            if (exists) {
                // check if i can join the room
                fb.playersRef = new Firebase(fb.playerUrl + "/" + roomId);

                fb.playersRef.once('value', function(snapshot) {
                    game.activePlayers = snapshot.val();
                    game.showPlayersInRoom();
                });

                fb.playersRef.on("child_added", fb.onPlayerAdded);
                fb.playersRef.on("child_changed", fb.onPlayerChanged);

                var roomsRef = new Firebase(fb.roomUrl + "/" + roomId);

                roomsRef.on("child_changed", fb.onActiveRoomChanged);
                roomsRef.once("value", function(snapshot) {
                    var val = snapshot.val();
                    console.log(val);
                    game.updateOrder(val);
                })

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

        // room exist callback
        playerExistsCallback: function(roomId, playerId, exists) {

            if (exists) {
                // check if i can join the room
                game.displayError("SORRY " + playerId + " ALREADY EXISTS IN ROOM " + roomId);
            } else {

                this.playersRef = new Firebase(this.playerUrl + "/" + roomId);

                // setup the game level variables
                this.playersRef.on('value', function(snapshot) {
                    game.activePlayers = snapshot.val();
                });

                var numPlayers = Object.keys(game.activePlayers).length;

                if (numPlayers < this.MAX_IN_ROOM) {
                    // create the player

                    game.playerId = playerId;
                    game.roomId = roomId;


                    // get the avatar
                    var avatar = $("#avatar").val();

                    // this.playersRef = new Firebase(this.playerUrl + "/" + roomId);
                    this.playersRef.child(playerId).set({
                        name: playerId,
                        active: true,
                        avatar: avatar,
                        position: 0
                    });

                    // listen for changed to the players
                    this.playersRef.on("child_added", this.onPlayerAdded);
                    this.playersRef.on("child_changed", this.onPlayerChanged);

                   

                    // board.init();

                    this.roomsRef = new Firebase(fb.roomUrl + "/" + roomId);

                    this.roomsRef.once('value', function(snapshot) {
                        var val = snapshot.val();

                        var newOrder = val.order || [];
                        newOrder.push(playerId);

                        if (numPlayers == 3) {
                            fb.roomsRef.set({
                                name: roomId,
                                open: false,
                                order: newOrder,
                                currentPlayerTurn: 0
                            });
                        } else {
                            fb.roomsRef.set({
                                name: roomId,
                                open: true,
                                order: newOrder,
                                currentPlayerTurn: 0
                            });
                        }

                        var rr = new Firebase(fb.roomUrl + "/" + roomId);

                        rr.once('value', function(snapshot) {
                            var val = snapshot.val();
                            
                            game.updateOrder(val);
                        });

                        // board.init();
                    });

                    fb.playersRef.onDisconnect().remove();
                    fb.roomsRef.onDisconnect().remove();

                    fb.roomsRef.on("child_changed", this.onActiveRoomChanged);

                    fb.playersRef.once('value', function(snapshot) {
                        game.activePlayers = snapshot.val();
                        game.showPlayersInRoom();
                    });

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
            this.playersRef.child(playerId).once('value', function(snapshot) {
                var obj = snapshot.val();
                obj.position += rollAmount;
                fb.playersRef.child(playerId).set(obj);

                game.rollComplete();
            });

        },

        nextTurn: function () {
            this.roomsRef = new Firebase(this.roomUrl + "/" + game.roomId);

            this.roomsRef.once('value', function(snapshot) {
                var val = snapshot.val();
                var turn = val.currentPlayerTurn;
                turn ++;
                turn %= val.order.length;

                fb.roomsRef.set({
                    name: val.name,
                    open: false,
                    order: val.order,
                    currentPlayerTurn: turn
                });
            });
        },

        removePlayer: function(playerId) {
            var removeRef = new Firebase(this.playerUrl + "/" + game.roomId + "/" + game.playerId);
            removeRef.remove();
        },

        movePlayer: function(playerId, moveAmount) {
            fb.playersRef.child(playerId).once('value', function(snapshot) {
                var obj = snapshot.val();
                obj.position += moveAmount;
                fb.playersRef.child(playerId).set(obj);
            });
        },

        joinRoom: function(playerId) {

        },

        onActiveRoomChanged: function(snapshot) {
            var data = snapshot.val();
            console.log("ACTIVE ROOM CHANGED", data);
            // 

            fb.playersRef.once('value', function(snapshot) {
                game.activePlayers = snapshot.val();
                game.showPlayersInRoom();
            });

            fb.roomsRef.once("value", function(snapshot) {
                var data = snapshot.val();
                game.updateTurn(data);
            });

        },

        onPlayerAdded: function(snapshot) {
            var data = snapshot.val();
            console.log("NEW PLAYER ADDED", data);
            game.playerChanged(data);
        },

        onPlayerChanged: function(snapshot) {
            var data = snapshot.val();
            console.log("PLAYER INFO CHANGED", data);
            game.playerChanged(data);
        },


    };

    window.fb = fb;

})();
