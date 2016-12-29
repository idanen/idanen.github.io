(function () {
  'use strict';

  angular.module('pokerManager', ['ui.router', 'ngAnimate', 'angulartics', 'angulartics.google.analytics',
    'ui.bootstrap', 'mgcrea.ngStrap', 'firebase', 'firebase.ref', 'pushState', 'ngclipboard',
    'pokerManager.filters', 'pokerManager.services', 'pokerManager.controllers'])
    .config(['$compileProvider', $compileProvider => {
      $compileProvider.debugInfoEnabled(false);
    }]);
}());
