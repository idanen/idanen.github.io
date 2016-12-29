(function () {
  'use strict';

  angular.module('pokerManager')
    .component('paperConfirmButton', {
      controller: PaperConfirmButtonController,
      bindings: {
        onActionConfirmed: '&'
      }
    });

  PaperConfirmButtonController.$inject = ['$element', '$scope'];
  function PaperConfirmButtonController($element, $scope) {
    this.$element = $element;
    this.$scope = $scope;
  }

  PaperConfirmButtonController.prototype = {
    $postLink: function () {
      this.$element[0].addEventListener('action-confirmed', ev => {
        this.$scope.$applyAsync(() => this.onActionConfirmed(ev));
      });
    }
  };
}());
