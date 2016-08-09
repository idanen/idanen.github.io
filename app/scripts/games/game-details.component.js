(function () {
  'use strict';

  class GameDetails {
    constructor($element) {
      this.$element = $element;
    }

    $onInit() {
      this.details = _.pick(this.game, ['location', 'date', 'numberOfHands']);
    }

    $onChanges(changes) {
      if (!this.details) {
        this.details = {};
      }
      if (changes.game && changes.game.currentValue) {
        _.forEach(changes.game.currentValue, (detail, key) => {
          if (detail !== this.details[key]) {
            this.details[key] = detail;
          }
        });
      }
    }

    $postLink() {
      this.$element.on('input', '.form-control', () => {
        this.onUpdate({details: this.details});
      });
    }

    $onDestroy() {
      this.$element.off();
    }

    numberOfHandsUpdated(counter) {
      this.details.numberOfHands = counter;
      this.onUpdate({details: this.details});
    }
  }

  GameDetails.$inject = ['$element'];

  angular.module('pokerManager')
    .component('gameDetails', {
      controller: GameDetails,
      templateUrl: 'scripts/games/game-details-tmpl.html',
      bindings: {
        game: '<',
        onUpdate: '&'
      }
    });
}());
