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

  function GameSettingsController($element) {
    this.$element = $element;
  }

  GameSettingsController.prototype = {
    $onInit: function () {
      this.settings = _.pick(this.game, ['chipValue', 'defaultBuyin', 'hostingCosts'])
    },
    $postLink: function () {
      this.$element.on('input', '.form-control', () => {
        this.onUpdate({
          settings: this.settings
        });
      });
    },
    chipsValueUpdated: function (newChipValue) {
      this.settings.chipValue = newChipValue;
      this.onUpdate({
        settings: this.settings
      });
    }
  };
}());
