(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersMembership', PlayersMembership);

  PlayersMembership.$inject = ['$q', 'Ref', 'Players', 'communitiesSvc', 'userService'];
  function PlayersMembership($q, Ref, Players, communitiesSvc, userService) {
    this.$q = $q;
    this.playersRef = Ref.child('players');
    this.communitiesRef = Ref.child('communities');
    this.playersSvc = Players;
    this.communitiesSvc = communitiesSvc;
    this.userService = userService;
  }

  PlayersMembership.prototype = {
    /**
     * @name addPlayer
     * @description
     * Saves the given player and signs him to the given community, if one is provided.
     * @param {Object} player The player to save.
     * @param {Object} [community] A community to add the given player to.
     * @returns {Promise} A promise that resolves with
     */
    addPlayer: function (player, community) {
      return this.playersSvc.save(player)
        .then(this.playersSvc.joinCommunity.bind(this.playersSvc, player, community))
        .then(this.communitiesSvc.addMember.bind(this.communitiesSvc, player, community));
    },
    /**
     * @name setAdminOfCommunity
     * @description
     * Sets player associated to the given `userId` to be the admin and member in the given community.
     * @param {Object} community The community the player will be the admin of.
     * @param {string} userId The user's identifier.
     */
    setAdminOfCommunity: function (community, userId) {
      // Fetch player
      this.playersSvc.findBy('userUid', userId)
        .then(this.setPlayerAsAdminOfCommunity.bind(this, community));
    },
    /**
     * @name setPlayerAsAdminOfCommunity
     * @description
     * Sets given player to be the admin and member in the given community.
     * @param {Object} community The community the player will be the admin of.
     * @param {Object} player The player to set as admin (and member).
     * @returns {Promise} An angular promise that resolves with results of all transactions
     */
    setPlayerAsAdminOfCommunity: function (community, player) {
      var promises = [];
      promises.push(this.playersSvc.joinCommunity(player, community));
      promises.push(this.communitiesSvc.addAdmin(player, community));
      promises.push(this.communitiesSvc.addMember(player, community));
      return this.$q.all(promises);
    }
  };
}());
