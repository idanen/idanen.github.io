/* Controllers */

angular.module( 'pokerManager.controllers', [] ).
	controller( 'MainCtrl', [ '$scope', '$location', 'Auth', 'jrgGoogleAuth', function ( $scope, $location, Auth, jrgGoogleAuth ) {
		'use strict';

		var adminTab = {
			title: "Current Game",
			href: "#/view1/0",
			icon: "icon-spades"
		};

		$scope.tabs = [];
		
		$scope.getLocation = function() {
			return $location.path();
		};
		$scope.setLocation = function( location ) {
			$location.path( location );
		};
		
		$scope.isTabSelected = function( tabHref ) {
			return ( tabHref.substring( 1 ) === $location.path() );
		};
		
		$scope.isAdmin = function() {
			return ( !!Auth.getUser() );
		};

		$scope.signOut = signOut;

		$scope.$watch( function () {
			return $scope.isAdmin();
		}, function ( newVal ) {
			if ( newVal && $scope.tabs.length < 2 ) {
				$scope.tabs.push( adminTab );
			} else {
				var adminTabIdx = $scope.tabs.indexOf( adminTab );
				if ( adminTabIdx > -1 ) {
					$scope.tabs.splice( adminTabIdx, 1 );
				}
			}
		} );
		
		$scope.init = function() {
			$scope.tabs.push( {
				title: "Stats",
				href: "#/stats",
				icon: "fa-bar-chart"
			} );
			if ( $scope.isAdmin() ) {
				$scope.tabs.push( adminTab );
			}
		};

		$scope.$on( '$locationChangeStart', function ( ev, from, to ) {
			if ( /login$/i.test( to ) ) {
				$scope.currentUser = Auth.getUser();
			}
		} );

		function signOut() {
			jrgGoogleAuth.logout().then( function () {
				Auth.revokeToken().then( function () {
					delete $scope.currentUser;
				} );
			} );
		}
	} ] ).
	controller( 'MyCtrl2', [ '$scope', 'Players', 'Games', '$analytics', function ( $scope, Players, Games, $analytics ) {
		'use strict';

		var vm = this;

		vm.players = Players.query();
		vm.games = Games.query();

		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};
		vm.prefs = {
				playersOpen: false
			};
		vm.today = new Date();
		vm.serverMsg = [];

		vm.game = Games.create();

		vm.refresh = function () {
			vm.players = Players.query();
			vm.games = Games.query();
		};

		vm.newPlayer = function () {
			var player = new Players();
			player.name = 'Johnny';
			player.$save();
		};

		vm.newGame = function () {
			var game = Games.create();
			Games.save( game );
		};

		vm.save = function ( index ) {
			vm.players[ index ].$update( function ( saved ) {
				console.log(saved);
			}, function ( err ) {
				console.log( 'error: ', err );
			} );
		};

		vm.addPlayerToGame = function ( player ) {
			if ( !player.isPlaying ) {
				player.isPlaying = true;
				player.buyin = 0;
				player.buyout = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
				vm.game.players.push( player );
			}
			
			try {
				$analytics.eventTrack('Buyin', { category: 'Actions', label: player.name });
			} catch (err) {}
		};
	
		vm.toggleGameDate = function( $event, index ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			vm.games[ index ].dateOpen = !vm.games[ index ].dateOpen;
		};

		vm.getPlayersOfGame = function ( game ) {
			game.players = Games.getPlayers( { gameId: game.id }, function ( data ) {
				// console.log( 'got players: ', data );
			} );
		};

		vm.saveGame = function ( index ) {
			vm.games[ index ].$update();
		};

		vm.addServerMsg = function( msg ) {
			vm.serverMsg.push( msg );
		};

		vm.closeServerMsg = function( index ) {
			vm.serverMsg.splice( index, 1 );
		};

		vm.gameSaved = function ( savedGame ) {
			vm.game = Games.create();
			vm.games = Games.query();

			vm.addServerMsg( {
				txt: 'Game saved successfully',
				type: 'success'
			} );
		};

		vm.saveGameFailed = function ( err ) {
			console.log( err );
			vm.addServerMsg( {
				txt: 'Error saving Game',
				type: 'error'
			} );
		};
	} ] );