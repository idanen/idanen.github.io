(function () {
  'use strict';

  ngTapDrtvFactory.$inject = ['$parse'];
  function ngTapDrtvFactory($parse) {
    return {
      restrict: 'A',
      compile: function ($element, attr) {
        let fn = $parse(attr.ngTap, null, true);
        return function (scope, element) {
          element.on('tap', function (event) {
            scope.$applyAsync(() => fn(scope, {$event: event}));
          });
        };
      }
    };
  }

  angular.module('pokerManager')
    .directive('ngTap', ngTapDrtvFactory);
}());
