'use strict';


// Declare app level module which depends on filters, and services
angular.module('pokerManager', ['ngRoute', 'ngAnimate', 'angulartics', 'angulartics.google.analytics', 'ui.bootstrap', 'mgcrea.ngStrap.tooltip', 'mgcrea.ngStrap.popover', 'pokerManager.filters', 'pokerManager.services', 'pokerManager.directives', 'pokerManager.controllers']).
	config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
		$routeProvider.when('/view1/:gameId', {templateUrl: 'partials/partial1.html', controller: 'PokerManagerCtrl', controllerAs: 'vm'});
		$routeProvider.when('/stats', {templateUrl: 'partials/poker-stats.html', controller: 'PokerStatsCtrl'});
		$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2', controllerAs: 'vm'});
		$routeProvider.otherwise({redirectTo: '/stats'});
	}]);
