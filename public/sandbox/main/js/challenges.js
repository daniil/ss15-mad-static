(function() {
  var challenges = { 

    challengeRef: new Firebase(fb.challengeUrl),

    startChallenge: function(player1Id, player2Id) {
      var players = this.challengeRef.child(game.roomId).child(players);

        players.child(player1Id).set({
          role: 'lead',
          score: 0
        });

        players.child(player2Id).set({
          role: 'wait',
          score: 0
        });
    }

  };

  window.challenges = challenges;

})();
