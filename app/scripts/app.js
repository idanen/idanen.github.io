(function () {
    'use strict';

    angular.module('pokerManager', ['ngRoute', 'ui.router', 'ngAnimate', 'angulartics', 'angulartics.google.analytics',
        'ui.bootstrap', 'mgcrea.ngStrap', 'toaster', 'firebase', 'firebase.ref',
        'firebase.auth', 'jackrabbitsgroup.angular-google-auth', 'directive.g+signin', 'pokerManager.filters',
        'pokerManager.services', 'pokerManager.directives', 'pokerManager.controllers'])
        .constant('BASE_URL', {
            "DEV": "http://localhost:9880/services/",
            "PROD": "https://awesome-sphere-397.appspot.com/services/"
        })
        .config(config);

    config.$inject = ['$routeProvider'];
    function config($routeProvider) {
        $routeProvider.when('/game/:gameId', {
            templateUrl: 'partials/partial1.html',
            controller: 'PokerManagerCtrl',
            controllerAs: 'vm',
            resolve: {
                game: gameRouteResolver
            }
        });
        $routeProvider.when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
            controllerAs: 'authCtrl'
        });
        $routeProvider.when('/stats', {
            templateUrl: 'partials/poker-stats.html',
            controller: 'PokerStatsCtrl',
            controllerAs: 'vm'
        });
        $routeProvider.when('/communities', {
            templateUrl: 'scripts/communities/communities.view.html',
            controller: 'CommunitiesCtrl',
            controllerAs: 'vm'
        });
        $routeProvider.when('/view2', {
            templateUrl: 'partials/partial2.html',
            controller: 'MyCtrl2',
            controllerAs: 'vm'
        });
        $routeProvider.otherwise({redirectTo: '/communities'});
    }

    gameRouteResolver.$inject = ['$route', '$firebaseObject', 'Ref'];
    function gameRouteResolver($route, $firebaseObject, Ref) {
        return $firebaseObject(Ref.child('game/' + $route.current.params.gameId));
    }
}());
