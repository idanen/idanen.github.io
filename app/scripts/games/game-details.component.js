(function () {
  'use strict';

  class GameDetails {
    static get $inject() {
      return ['$element'];
    }
    constructor($element) {
      this.$element = $element;
    }

    $onInit() {
      this.details = _.pick(this.game, ['location', 'date', 'numberOfHands']);
    }

    $onChanges(changes) {
      if (changes.game && changes.game.currentValue) {
        this.details = _.pick(this.game, ['location', 'date', 'numberOfHands']);
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
      this.details.numberOfHands = counter || 0;
      this.onUpdate({details: this.details});
    }
  }

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
