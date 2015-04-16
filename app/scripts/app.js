// Declare app level module which depends on filters, and services
angular.module( 'pokerManager', [ 'ngRoute', 'ngAnimate', 'ng-token-auth', 'angulartics', 'angulartics.google.analytics', 'ui.bootstrap', 'mgcrea.ngStrap.tooltip', 'mgcrea.ngStrap.popover', 'pokerManager.filters', 'pokerManager.services', 'pokerManager.directives', 'pokerManager.controllers' ] ).
	config( [ '$routeProvider', '$httpProvider', '$authProvider', 'BASE_URL', function ( $routeProvider, $httpProvider, $authProvider, BASE_URL ) {
		'use strict';

		$authProvider.configure({
            apiUrl: BASE_URL.PROD + '/auth'
        });

		$routeProvider.when( '/view1/:gameId', { templateUrl: 'partials/partial1.html', controller: 'PokerManagerCtrl', controllerAs: 'vm' } );
		$routeProvider.when( '/login', { templateUrl: 'partials/login.html', controller: 'LoginCtrl', controllerAs: 'authCtrl' } );
		$routeProvider.when( '/stats', { templateUrl: 'partials/poker-stats.html', controller: 'PokerStatsCtrl', controllerAs: 'vm' } );
		$routeProvider.when( '/view2', { templateUrl: 'partials/partial2.html', controller: 'MyCtrl2', controllerAs: 'vm' } );
		$routeProvider.otherwise( { redirectTo: '/stats' } );
	} ] );
