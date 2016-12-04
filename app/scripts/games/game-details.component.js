(function () {
  'use strict';

  class GameDetails {
    static get $inject() {
      return ['$element', 'locationsSvc', 'gameLocationDialogSvc'];
    }
    constructor($element, locationsSvc, gameLocationDialogSvc) {
      this.$element = $element;
      this.locationsSvc = locationsSvc;
      this.gameLocationDialogSvc = gameLocationDialogSvc;
    }

    $onInit() {
      this.details = _.pick(this.game, ['location', 'date', 'numberOfHands']);
    }

    $onChanges(changes) {
      if (changes.game && changes.game.currentValue) {
        this.details = _.pick(this.game, ['location', 'date', 'numberOfHands']);
        this.locationsSvc.getAddress(this.details.location, this.game.communityId)
          .then(address => {
            this.details.address = address;
          });
      }
    }

    $postLink() {
      this.$element.on('input', '.form-control', () => {
        this.onUpdate({details: this.details});
      });

      this.$element.find('.show-on-map-btn').on('tap', () => this.showOnMap());
    }

    $onDestroy() {
      this.$element.off();
      this.$element.find('.show-on-map-btn').off();
    }

    numberOfHandsUpdated(counter) {
      this.details.numberOfHands = counter || 0;
      this.onUpdate({details: this.details});
    }

    showOnMap() {
      this.gameLocationDialogSvc.open();
      this.gameLocationDialogSvc.markAddress(this.details.address);
    }

    locationSelected($event) {
      this.details.location = $event.name;
      this.details.address = $event.address;
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
