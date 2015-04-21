// Declare app level module which depends on filters, and services
angular.module( 'pokerManager', [ 'ngRoute', 'ngAnimate', 'angulartics', 'angulartics.google.analytics', 'ui.bootstrap', 'mgcrea.ngStrap.tooltip', 'mgcrea.ngStrap.popover', 'jackrabbitsgroup.angular-google-auth', 'directive.g+signin', 'pokerManager.filters', 'pokerManager.services', 'pokerManager.directives', 'pokerManager.controllers' ] ).
	constant( 'BASE_URL', {
		"DEV": "http://localhost:9880/services/",
		"PROD": "http://awesome-sphere-397.appspot.com/services/"
	} ).
	config( [ '$routeProvider', '$httpProvider', 'jrgGoogleAuthProvider', 'AuthProvider', 'PlayersProvider', 'GamesProvider', 'UtilsProvider', 'BASE_URL', function ( $routeProvider, $httpProvider, jrgGoogleAuthProvider, AuthProvider, PlayersProvider, GamesProvider, utilsProvider, BASE_URL ) {
		'use strict';

		PlayersProvider.setBaseUrl( BASE_URL.PROD );
		GamesProvider.setBaseUrl( BASE_URL.PROD );
		AuthProvider.setBaseUrl( BASE_URL.PROD.replace(/services/i, 'auth') );

		jrgGoogleAuthProvider.configure({
			client_id: '1053634869128-rj5rm5ilcdna5rhcp2n6ank7tj1j4rdq.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
        });

		// Register interceptor
		$httpProvider.interceptors.push( 'authInterceptor' );

		$httpProvider.defaults.headers.post.Authorization = $httpProvider.defaults.headers.put.Authorization = utilsProvider.getToken();

		$routeProvider.when( '/view1/:gameId', { templateUrl: 'partials/partial1.html', controller: 'PokerManagerCtrl', controllerAs: 'vm' } );
		$routeProvider.when( '/login', { templateUrl: 'partials/login.html', controller: 'LoginCtrl', controllerAs: 'authCtrl' } );
		$routeProvider.when( '/stats', { templateUrl: 'partials/poker-stats.html', controller: 'PokerStatsCtrl', controllerAs: 'vm' } );
		$routeProvider.when( '/view2', { templateUrl: 'partials/partial2.html', controller: 'MyCtrl2', controllerAs: 'vm' } );
		$routeProvider.otherwise( { redirectTo: '/stats' } );
	} ] );
