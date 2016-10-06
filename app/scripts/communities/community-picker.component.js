(function () {
  'use strict';

  angular.module('pokerManager')
    .component('communityPicker', {
      controller: CommunityPickerController,
      bindings: {
        communities: '<',
        selected: '<',
        onSelect: '&'
      },
      template: `
      <vaadin-combo-box label="Community"></vaadin-combo-box>
      `
    });

  CommunityPickerController.$inject = ['$element', '$scope'];
  function CommunityPickerController($element, $scope) {
    this.$element = $element;
    this.$scope = $scope;
    this.picker = this.$element.find('vaadin-combo-box')[0];
  }

  CommunityPickerController.prototype = {
    $postLink: function () {
      this.picker.addEventListener('value-changed', event => {
        this.$scope.$applyAsync(() => this.onSelect({$event: event.detail.value}));
      });
    },

    $onChanges: function () {
      if (this.communities && _.isFunction(this.communities.$loaded)) {
        this.communities.$loaded()
          .then(() => this.setCommunities());
      } else {
        this.setCommunities();
      }

      this.picker.value = this.selected;
    },

    setCommunities: function () {
      this.picker.items = this.communities;
    }
  };
}());

