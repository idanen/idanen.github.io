(function () {
    'use strict';

    angular.module('pokerManager', ['ngRoute', 'ui.router', 'ngAnimate', 'angulartics', 'angulartics.google.analytics',
        'ui.bootstrap', 'mgcrea.ngStrap', 'toaster', 'firebase', 'firebase.ref',
        'firebase.auth', 'jackrabbitsgroup.angular-google-auth', 'directive.g+signin', 'pokerManager.filters',
        'pokerManager.services', 'pokerManager.directives', 'pokerManager.controllers'])
        .constant('BASE_URL', {
            "DEV": "http://localhost:9880/services/",
            "PROD": "https://awesome-sphere-397.appspot.com/services/"
        });
}());
