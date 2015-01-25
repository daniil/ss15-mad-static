(function() {
  var challenges = { 

    challengeRef: new Firebase(fb.challengeUrl),

    startChallenge: function(player1Id, player2Id) {
      var room = this.challengeRef.child(game.roomId),
          playersObj = {};

      playersObj[player1Id] = {
        role: 'lead',
        score: 0
      };

      playersObj[player2Id] = {
        role: 'wait',
        score: 0
      };

      room.set({
        players: playersObj
      });

      room.child('players').child(game.playerId).on('value', function(s) {
        console.log('load game');
      });

        // players.child(player1Id).set({
        //   role: 'lead',
        //   score: 0
        // });

        // players.child(player2Id).set({
        //   role: 'wait',
        //   score: 0
        // });
    }

  };

  window.challenges = challenges;

})();
