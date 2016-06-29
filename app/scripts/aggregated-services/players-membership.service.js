(function () {
  'use strict';

  angular.module('pokerManager')
    .service('playersMembership', PlayersMembership);

  PlayersMembership.$inject = ['$q', 'Ref'];
  function PlayersMembership($q, Ref) {
    this.$q = $q;
    this.playersRef = Ref.child('players');
    this.communitiesRef = Ref.child('communities');
  }

  PlayersMembership.prototype = {
    /**
     * @name addPlayer
     * @description
     * Saves the given player and signs him to the given community, if one is provided.
     * @param {Object} player The player to save.
     * @param {Object} [community] A community to add the given player to.
     */
    addPlayer: function (player, community) {
      
    }
  };
}());
