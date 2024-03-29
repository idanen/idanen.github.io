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

      this.titleInput = $element.find('.game-title-input')[0];

      this.RELEVANT_FIELDS = ['location', 'date', 'numberOfHands', 'title', 'address'];
    }

    $onInit() {
      this.details = this._onlyRelevantFields(this.game);

      this.titleInput.value = this.details.title || '';
      this.titleInput.addEventListener('input', this.gameTitleChange.bind(this));
    }

    $onChanges(changes) {
      if (changes.game && changes.game.currentValue) {
        this.details = this._onlyRelevantFields(this.game);
        this.locationsSvc.getAddress(this.details.location, this.game.communityId)
          .then(address => {
            this.details.address = address;
          });
      }
    }

    $postLink() {
      this.$element.on('input', '.form-control', () => {
        this.sendUpdate();
      });

      this.$element.find('.show-on-map-btn').on('tap', () => this.showOnMap());
    }

    $onDestroy() {
      this.$element.off();
      this.$element.find('.show-on-map-btn').off();
    }

    gameTitleChange() {
      this.details.title = this.titleInput.value;
      this.sendUpdate();
    }

    numberOfHandsUpdated(counter) {
      this.details.numberOfHands = counter || 0;
      this.sendUpdate();
    }

    showOnMap() {
      this.gameLocationDialogSvc.open(this.details.address);
    }

    locationSelected($event) {
      this.details.location = $event.name;
      this.details.address = $event.address;
      this.sendUpdate();
    }

    sendUpdate() {
      this.onUpdate({details: this._onlyRelevantFields(this.details)});
    }

    _onlyRelevantFields(gameOrDetails) {
      return _.pick(gameOrDetails, this.RELEVANT_FIELDS);
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
