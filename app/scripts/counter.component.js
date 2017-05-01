(function () {
  'use strict';

  angular.module('pokerManager')
    .component('pkCounter', {
      controller: CounterController,
      bindings: {
        counter: '<',
        onUpdate: '&'
      },
      template: `
        <div class="btn-group">
          <button class="btn btn-sm btn-success" ng-click="$ctrl.increment()"><i class="icon icon-plus"></i></button>
          <button class="btn btn-sm btn-default" style="width: 80px;">{{ $ctrl.counter }}</button>
          <button class="btn btn-sm btn-danger" ng-click="$ctrl.decrement()" ng-disabled="$ctrl.counter <= 0"><i class="icon icon-minus"></i></button>
        </div>
      `
    });

  CounterController.$inject = ['$element'];
  function CounterController($element) {
    this.$element = $element;
  }

  CounterController.prototype = {
    $onInit: function () {
      if (isNaN(this.counter)) {
        this.counter = 0;
        this._callUpdateListener();
      }
    },
    increment: function () {
      this.counter += 1;
      this._callUpdateListener();
    },
    decrement: function () {
      if (this.counter > 0) {
        this.counter -= 1;
        this._callUpdateListener();
      }
    },

    _callUpdateListener: function () {
      if (this.onUpdate) {
        this.onUpdate({counter: this.counter});
      }
    }
  };
}());
