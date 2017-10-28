(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersMembership', PlayersMembership);

  PlayersMembership.$inject = ['$q', 'Ref', 'Players', 'communitiesSvc', 'userService'];
  function PlayersMembership($q, Ref, Players, communitiesSvc, userService) {
    this.$q = $q;
    this.rootRef = Ref;
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
     * @returns {Promise} A promise that resolves when user is created and added to the given community (if one was provided).
     */
    addPlayer: function (player, community) {
      return this.$q.resolve(
        this.playersSvc.save(player)
          .then(() => this.playersSvc.joinCommunity(player, community, true))
          .then(() => this.communitiesSvc.addMember(player, community))
      );
    },

    /**
     * @name setAdminOfCommunity
     * @description
     * Sets player associated to the given `userId` to be the admin and member in the given community.
     * @param {Object} community The community the player will be the admin of.
     * @param {string} userId The user's identifier.
     * @returns {Promise} A promise resolves when finished syncing data to server
     */
    setAdminOfCommunity: function (community, userId) {
      // Fetch player
      return this.playersSvc.findBy('userUid', userId)
        .then(this.setPlayerAsAdminOfCommunity.bind(this, community));
    },

    /**
     * @name createCommunityWithAdmin
     * @description
     * Creates a new community and sets the given user's player as the admin
     *
     * @param {Object} newCommunity The community's details
     * @param {string} userId The user that creates the community
     * @returns {Promise<null>} A promise that resolves once all data paths are updated
     */
    createCommunityWithAdmin: function (newCommunity, userId) {
      return this.communitiesSvc.createCommunity(newCommunity)
        .then(community => this.setAdminOfCommunity(community, userId));
    },

    /**
     * @name confirmJoiningPlayer
     * @description
     * For admins - joins the requesting player to the community
     * @param {string} userId The user's identifier.
     * @param {Object} community The community the player will be joining.
     * @returns {Promise} A promise resolves when finished syncing data to server
     */
    confirmJoiningPlayer: function (userId, community) {
      return this.playersSvc.findBy('userUid', userId)
        .then(player => {
          const communityUpdates = {};
          const playerUpdates = {};

          communityUpdates[`${community.$id}/members/${player.$id}`] = player.displayName;
          communityUpdates[`${community.$id}/joiners/${userId}`] = null;
          playerUpdates[`${player.$id}/membership/${community.$id}/type`] = 'member';
          playerUpdates[`${player.$id}/guestOf`] = null;

          return this.$q.all([
            this.playersRef.update(playerUpdates),
            this.communitiesRef.update(communityUpdates)
          ]);
        });
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
      return this.$q.all([
        this.playersSvc.joinCommunity(player, community),
        this.communitiesSvc.addAdmin(player, community),
        this.communitiesSvc.addMember(player, community)
      ]);
    }
  };
}());
