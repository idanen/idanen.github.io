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
      this.settings = _.pick(this.game, ['chipValue', 'defaultBuyin', 'hostingCosts']);
    },
    $postLink: function () {
      this.$element.on('input', '.form-control', () => {
        this.onUpdate({
          settings: this.settings
        });
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
    }
  };
}());
