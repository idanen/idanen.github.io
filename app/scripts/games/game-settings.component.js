(function () {
  'use strict';

  angular.module('pokerManager')
    .component('gameSettings', {
      controller: GameSettingsController,
      templateUrl: 'scripts/games/game-settings-tmpl.html',
      bindings: {
        game: '<',
        onUpdate: '&'
      }
    });

  GameSettingsController.$inject = ['$element', 'communitiesSvc'];
  function GameSettingsController($element, communitiesSvc) {
    this.$element = $element;
    this.communitiesSvc = communitiesSvc;
  }

  GameSettingsController.prototype = {
    $onInit: function () {
      this.settings = _.pick(this.game, ['chipValue', 'defaultBuyin', 'hostingCosts', 'allowedGuests', 'limitPlayers']);
      if (isNaN(this.settings.hostingCosts)) {
        this.settings.hostingCosts = 10;
      }
      if (isNaN(this.settings.allowedGuests) || this.settings.allowedGuests < 0) {
        this.settings.allowedGuests = 0;
      }
      if (isNaN(this.settings.limitPlayers) || this.settings.limitPlayers < 0) {
        this.settings.limitPlayers = 20;
      }
    },
    $postLink: function () {
      this.$element.on('input', '.form-control', () => {
        this.onUpdate({
          settings: this.settings
        });
      });

      this.$element.on('tap', '.save-community-default', () => {
        this.saveGameSettingsAsDefault();
      });
    },

    $onDestroy: function () {
      this.$element.off();
    },

    saveGameSettingsAsDefault: function () {
      if (this.game.communityId) {
        this.communitiesSvc.setDefaultGameSettings(this.game.communityId, this.settings);
      }
    },

    chipsValueUpdated: function (newChipValue) {
      this.settings.chipValue = newChipValue;
      this.onUpdate({
        settings: this.settings
      });
    },

    allowedGuestsUpdated: function (counter) {
      this.settings.allowedGuests = counter || 0;
      this.onUpdate({
        settings: this.settings
      });
    },

    limitPlayersUpdated: function (counter) {
      this.settings.limitPlayers = counter || 20;
      this.onUpdate({
        settings: this.settings
      });
    }
  };
}());
