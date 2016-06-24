(function () {
  'use strict';

  angular.module('pokerManager', ['ui.router', 'ngAnimate', 'angulartics', 'angulartics.google.analytics',
    'ui.bootstrap', 'mgcrea.ngStrap', 'toaster', 'firebase', 'firebase.ref', 'pushState',
    'pokerManager.filters', 'pokerManager.services', 'pokerManager.controllers'])
    .constant('BASE_URL', {
      DEV: 'http://localhost:9880/services/',
      PROD: 'https://awesome-sphere-397.appspot.com/services/'
    });
}());
