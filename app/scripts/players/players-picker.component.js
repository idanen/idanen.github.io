(function () {
  'use strict';

  class PlayersPickerController {
    static get $inject() {
      return ['$element', '$scope'];
    }
    constructor($element, $scope) {
      this.$element = $element;
      this.$scope = $scope;
      this.picker = this.$element.find('vaadin-combo-box')[0];
    }

    $postLink() {
      this.picker.addEventListener('value-changed', event => {
        this.$scope.$applyAsync(() => this.onSelect({$event: event.detail.value}));
      });
    }

    $onChanges(changes) {
      if (changes && changes.players && changes.players.currentValue && changes.players.currentValue !== changes.players.previousValue) {
        this.setPlayers();
      }

      this.picker.value = this.selected;
      if (changes && changes.selected && changes.selected.currentValue && changes.selected.currentValue !== changes.selected.previousValue) {
        this.$scope.$applyAsync(() => this.onSelect({$event: this.selected}));
      }
    }

    setPlayers() {
      this.picker.items = this.players.map(player => {
        return {
          value: player.$id,
          label: player.displayName
        };
      });
    }
  }

  angular.module('pokerManager')
    .component('playersPicker', {
      controller: PlayersPickerController,
      bindings: {
        players: '<',
        selected: '<',
        onSelect: '&'
      },
      template: `
<vaadin-combo-box label="Select Player"></vaadin-combo-box>
`
    });
}());
