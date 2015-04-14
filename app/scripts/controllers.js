/* Controllers */

angular.module( 'pokerManager.controllers', [] ).
	controller( 'MainCtrl', [ '$scope', '$location', 'Utils', function ( $scope, $location, utils ) {
		'use strict';

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
			return ( location.pathname.indexOf( 'manage.html' ) > -1 );
		};
		
		$scope.init = function() {
			if ( $scope.isAdmin() ) {
				$scope.tabs.push( {
					title: "Current Game",
					href: "#/view1/0",
					icon: "fa-heart",
					disabled: true
				} );
			}
			$scope.tabs.push( {
				title: "Stats",
				href: "#/stats",
				icon: "fa-bar-chart"
			} );
		};
	} ] ).
	controller( 'PokerStatsCtrl', [ '$modal', '$filter', 'Model', 'Utils', 'Games', 'Players', function( $modal, $filter, Model, utils, Games, Players ) {
		'use strict';

		var vm = this;

		vm.today = new Date();
		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};
		
		vm.displayGames = {
				fromDate: vm.today.setMonth( vm.today.getMonth() - 1 ),
				fromDateOpen: false,
				toDate: vm.today.setMonth( vm.today.getMonth() + 1 ),
				toDateOpen: false,
				players: []
			};

		function playerSaved( savedPlayer ) {
			// console.log('savedPlayer = ' + savedPlayer);
			var isNew = true,
				playerIdx, len,
				players = vm.displayGames.players;
			
			isNew = players.some( function ( player ) {
				return player.id === savedPlayer.id;
			} );
			
			if ( isNew ) {
				players.push( savedPlayer );
			} else {
				savedPlayer.buyin = players[ playerIdx ].buyin;
				savedPlayer.buyout = players[ playerIdx ].buyout;
				players[ playerIdx ] = savedPlayer;
			}
		}

		function formatDate( aDate ) {
			return $filter( 'date' )( aDate, 'y-MM-dd' );
		}

		function getPlayers() {
			return Games.players( { fromDate: formatDate( vm.displayGames.fromDate ), toDate: formatDate ( vm.displayGames.toDate ) } );
		}

		vm.init = function () {
			// Refresh view
			vm.displayGames.players = getPlayers();
		};
	
		vm.toggleDateRange = function ( which, $event ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			if (vm.displayGames[which + 'DateOpen']) {
				vm.displayGames[which + 'DateOpen'] = false;
			} else {
				vm.displayGames[which + 'DateOpen'] = true;
			}
		};
		
		vm.loadGames = function () {
			vm.displayGames.players = getPlayers();
		};
	
		vm.loadAllTimeGames = function () {
			vm.displayGames.fromDate = new Date( 2000, 9, 1 );
			vm.displayGames.toDate = new Date();
			vm.displayGames.players = getPlayers();
		};
		
		vm.statsAvgBuyin = function () {
			return utils.avgsCalc( vm.displayGames.players, 'buyin' );
		};

		vm.statsAvgBuyout = function () {
			return utils.avgsCalc( vm.displayGames.players, 'buyout' );
		};

		vm.statsAvgGameCount = function () {
			return utils.avgsCalc( vm.displayGames.players, 'gamesCount' );
		};
		
		vm.statsAvgWinnings = function () {
			var sum = 0;
			for( var i = 0; i < vm.displayGames.players.length; ++i ) {
				sum += ( vm.displayGames.players[ i ].buyout - vm.displayGames.players[ i ].buyin );
			}
			return sum;
		};
	
		vm.statsAvgWinningsPerGame = function () {
			var sum = 0;
			for( var i = 0; i < vm.displayGames.players.length; ++i ) {
				sum += ( vm.displayGames.players[ i ].buyout - vm.displayGames.players[ i ].buyin ) / vm.displayGames.players[ i ].gamesCount;
			}
			return sum / vm.displayGames.players.length;
		};

		vm.gamesCount = function () {
			return utils.maxCalc( vm.displayGames.players, 'gamesCount' );
		};

		vm.openPlayerDetailsDialog = function ( player ) {
			var isNew = ( player === null );

			if ( isNew ) {
				player = {
					name: '',
					balance: 0,
					isPlaying: false,
					buyin: 0,
					currentChipCount: 0,
					email: '',
					phone:'',
					id: 0,
					createDate: $filter( 'date' )( vm.today, 'y-MM-dd' ),
					isNew: true
				};
			}
			var modalInstance = $modal.open( {
				templateUrl: './partials/modals/addNewPlayer.html',
				controller: 'ModalPlayerDetailsCtrl',
				resolve: {
					player: function() {
						return player;
					}
				}
			} );

			modalInstance.result.then( function ( savedPlayer ) {
				// If new -> update default values
				if ( isNew ) {
					savedPlayer.buyin = 0;
					savedPlayer.isPlaying = false;
				}
				
				player = savedPlayer;
				
				Players.update( player ).$promise.then( playerSaved );
			} );
		};
	} ] ).
	controller( 'GameCtrl', [ '$scope', '$analytics', '$routeParams', 'Games', 'Utils', function ( $scope, $analytics, $routeParams, Game, utils ) {
		'use strict';

		var vm = this,
			chipValue,
			defaultBuyin;

		vm.dateOptions = {
				'year-format': "'yyyy'",
				'month-format': "'MM'",
				'day-format': "'dd'"
			};

		vm.initGame = function () {

			angular.element.extend( $scope.game, new Game() );
			delete $scope.game.id;

			// vm.game = new Game();

			// angular.element.extend( vm.game, ( angular.isDefined( $scope.game ) ) ?
			// 	$scope.game :
			// 	Game.create()
			// );

			// delete vm.game.id;

		};

		vm.clearGame = function () {
			// Reset is-playing state
			$scope.game.players.forEach( function( player ) {
				player.isPlaying = false;
				player.balance += ( player.buyout - player.buyin );
			} );
			$scope.game.players.splice( 0, $scope.game.players.length );
			
			// Reset game
			$scope.game = Game.create();
		};

		vm.initGame();

		$scope.$watch( 'game.settings.chipValue', function ( newVal ) {
			chipValue = newVal;
		} );
		$scope.$watch( 'game.settings.defaultBuyin', function ( newVal ) {
			defaultBuyin = newVal;
		} );

		vm.buyin = function( player, rationalBuyin ) {
			var buyin = rationalBuyin * defaultBuyin;
			if ( !player.isPlaying ) {
				player.isPlaying = true;
				player.buyin = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
				$scope.game.players.push( player );
			}
			player.buyin += buyin;
			player.balance -= player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) + ( buyin * chipValue );
			player.buyout = player.currentChipCount / chipValue;
			
			try {
				$analytics.eventTrack('Buyin', { category: 'Actions', label: player.name });
			} catch ( err ) {}
		};

		vm.cancelBuyin = function( player, rationalBuyin ) {
			var buyin = rationalBuyin * defaultBuyin;
			player.buyin -= buyin;
			player.balance += player.buyin;
			player.currentChipCount = parseInt( player.currentChipCount, 10 ) - ( buyin * chipValue );
			player.buyout = player.currentChipCount / chipValue;
		};

		vm.cancelAddPlayer = function( index ) {
			// Remove from current game
			var deleted = $scope.game.players.splice( index, 1 ),
				player = ( deleted && deleted.length ) ? deleted[ 0 ] : undefined;

			// Reset fields
			if ( player ) {
				player.isPlaying = false;
				player.balance += ( player.buyout - player.buyin );
				player.buyin = 0;
				player.buyout = 0;
				player.currentChipCount = 0;
				player.paidHosting = false;
			}
		};

		vm.bust = function( player ) {
			player.currentChipCount = 0;
			vm.buyout( player );
		};

		vm.buyout = function( player ) {
			if ( player.isPlaying ) {
				player.isPlaying = false;
			}

			// Add payout to player's balance
			player.buyout = player.currentChipCount / chipValue;
			player.balance += player.buyout;
		};
	
		vm.comeBack = function( player ) {
			if ( !player.isPlaying ) {
				player.isPlaying = true;
			}

			// Add payout to player's balance
			player.balance -= player.buyout;
		};
		
		vm.chipCountUpdate = function( player ) {
			player.buyout = player.currentChipCount / chipValue;
		};

		vm.addOrSubtractChips = function( player, howMany, toAdd ) {
			if ( toAdd ) {
				player.currentChipCount += ( howMany * defaultBuyin );
			} else {
				player.currentChipCount -= ( howMany * defaultBuyin );
			}
			vm.chipCountUpdate( player );
		};
	
		vm.totalBuyin = function () {
			return utils.totalsCalc( $scope.game.players, 'buyin' );
		};
	
		vm.totalChips = function () {
			return utils.totalsCalc( $scope.game.players, 'currentChipCount' );
		};
		
		vm.totalHosting = function () {
			var sum = 0;
			for( var i = 0; i < $scope.game.players.length; ++i ) {
				sum += $scope.game.players[ i ].paidHosting ? 10 : 0;
			}
			return sum;
		};
	
		vm.toggleGameDate = function ( $event ) {
			$event.preventDefault();
			$event.stopPropagation();
			
			$scope.game.dateOpen = !$scope.game.dateOpen;
		};

		vm.isGameInProgress = function () {
			return $scope.game.players.some( function ( player ) {
				return player.isPlaying;
			} );
		};

		vm.saveGame = function () {
			Game.save( $scope.game ).$promise.then( function gameSaveSuccess( data ) {
				if ( angular.isFunction( $scope.saveSuccessCallback ) ) {
					$scope.saveSuccessCallback( data );
				}
			}).catch( function gameSaveFail( err ) {
				if ( angular.isFunction( $scope.saveFailCallback ) ) {
					$scope.saveFailCallback( err );
				}
			} );
		};

	} ] ).
	controller( 'PokerManagerCtrl', [ '$scope', '$modal', '$filter', '$analytics', 'Model', 'Utils', 'Players', 'Games',
		function ( $scope, $modal, $filter, $analytics, Model, utils, Players, Games ) {
			'use strict';

			var vm = this;

			function playerSaved( savedPlayer ) {
				// console.log('savedPlayer = ' + savedPlayer);
				var isNew = true,
					playerIdx, len,
					players = vm.players;
				
				for ( playerIdx = 0, len = players.length; playerIdx < len; ++playerIdx ) {
					if ( players[ playerIdx ].id === savedPlayer.id) {
						isNew = false;
						break;
					}
				}
				
				if ( isNew ) {
					players.push( savedPlayer );
				} else {
					players[ playerIdx ] = savedPlayer;
				}
			}

			vm.prefs = {
					playersOpen: false
				};
			vm.dateOptions = {
					'year-format': "'yyyy'",
					'month-format': "'MM'",
					'day-format': "'dd'"
				};
			vm.today = new Date();
			vm.serverMsg = [];
			vm.players = [];
			vm.game = Games.create();

			vm.openPlayersControl = function() {
				vm.prefs.playersOpen = !vm.prefs.playersOpen;
			};

			vm.closePlayersControl = function() {
				vm.prefs.playersOpen = false;
			};

			$scope.$watch( function () {
				return vm.game.settings.chipValue;
			}, function ( newVal, oldValue ) {
				if ( !newVal ) {
					newVal = vm.game.settings.chipValue = 1;
				}
				vm.game.players.forEach( function updateChipsAndValue( player, idx ) {
					if ( player.currentChipCount ) {
						player.currentChipCount = player.currentChipCount * newVal / ( oldValue || 1 );
					} else {
						player.currentChipCount = ( player.buyin * newVal ) * newVal / ( oldValue || 1 );
					}
				} );
			} );
				
			vm.loadLocalStorageGame = function() {
				var oldChipValue = vm.game.settings.chipValue,
					newChipValue;

				function playerEntity( aPlayer ) {
					var found;
					found = vm.players.filter( function( player, i ) {
						return ( player.name === aPlayer.name );
					} );

					return found && found[0];
				}

				vm.game = utils.loadLocal( 'game' );
				newChipValue = parseInt( vm.game.settings.chipValue, 10 );
				// Players in game should be with same reference as players returned by the server
				for ( var i = 0; i < vm.game.players.length; ++i ) {
					var foundPlayer = playerEntity( vm.game.players[ i ] );
					
					if ( foundPlayer ) {
						// Copy fields from saved game
						var isPlaying = vm.game.players[ i ].isPlaying,
							buyin = vm.game.players[ i ].buyin,
							buyout = vm.game.players[ i ].buyout,
							currentChipCount = vm.game.players[ i ].currentChipCount * ( ( oldChipValue != newChipValue ) ? oldChipValue / newChipValue : 1 ),
							paidHosting = vm.game.players[ i ].paidHosting;

						// Assign reference
						vm.game.players[ i ] = foundPlayer;
						// Assign values from copied fields
						vm.game.players[ i ].isPlaying = true;
						vm.game.players[ i ].buyin = buyin;
						vm.game.players[ i ].buyout = buyout;
						vm.game.players[ i ].currentChipCount = currentChipCount;
						vm.game.players[ i ].paidHosting = paidHosting;
					}
				}
			};

			vm.saveGameToLocalStorage = function() {
				utils.saveLocal( 'game', vm.game );
			};

			$scope.$watch( function () {
				return vm.game;
			}, function ( newVal, oldVal ) {
				// When game is loaded the $watch is called even if the new and old values are the same - preventing it here by comparing them
				if ( !angular.equals( newVal, oldVal ) ) {
					vm.saveGameToLocalStorage();
				}
			}, true );

			vm.init = function() {
				//Refresh view
				vm.players = Players.query();
				vm.players.$promise.then( function () {
					if ( localStorage.getItem( 'game' ) !== null ) {
						vm.loadLocalStorageGame();
					}
				} );
			};

			vm.refreshPlayersList = function () {
				vm.players = Players.query();
			};
			
			vm.clearCurrentGame = function() {
				// Reset is-playing state
				vm.players.forEach( function( player ) {
					player.isPlaying = false;
				} );
				
				// Reset game
				vm.game = Games.create();

				// Save empty game as local
				vm.saveGameToLocalStorage();
			};

			vm.addServerMsg = function(msg) {
				vm.serverMsg.push(msg);
			};

			vm.closeServerMsg = function(index) {
				vm.serverMsg.splice(index, 1);
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

			vm.gameSaved = function ( savedGame ) {
				vm.init();
				vm.clearCurrentGame();

				vm.addServerMsg({
					txt: 'Game saved successfully',
					type: 'success'
				});
			};

			vm.saveGameFailed = function ( err ) {
				vm.addServerMsg({
					txt: 'Error saving Game',
					type: 'error'
				});
			};
			
			vm.getPlayerDetailsAndOpenDialog = function( playerId ) {
				Model.fetchPlayer(playerId);
			};

			vm.openPlayerDetailsDialog = function( player ) {
				var isNew = ( typeof( player ) === 'undefined' || player === null );

				vm.closePlayersControl();

				if (isNew) {
					player = Players.create();
				}
				var modalInstance = $modal.open( {
					templateUrl: './partials/modals/addNewPlayer.html',
					controller: 'ModalPlayerDetailsCtrl',
					resolve: {
						player: function() {
							return player;
						}
					}
				} );

				modalInstance.result.then( function( savedPlayer ) {
					// If new -> update default values
					if ( isNew ) {
						savedPlayer.buyin = 0;
						savedPlayer.isPlaying = false;
					// Update changed fields
					}
					
					player = savedPlayer;
					
					// Model.savePlayer( player );
					Players.update( player ).$promise.then( playerSaved );
				} );
			};
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
	} ] ).
	controller( 'ModalPlayerDetailsCtrl', [ '$scope', '$http', '$modalInstance', 'player', 'Model', function ( $scope, $http, $modalInstance, player, Model ) {
		'use strict';

		$scope.player = player;
		$scope.isAdmin = function() {
			return ( window.location.pathname.indexOf( 'manage.html' ) > -1 );
		};
		
		/*
		$scope.isAdmin = function() {
			//return ( location.hash.indexOf('manage', 0) > -1 );
			return $scope.admin;
		};
		*/
		
		$scope.calcBalance = function() {
			var sum = 0;
			if ($scope.player.games) {
				
				$scope.player.games.forEach(function(game) {
					sum += game.players[0].buyout - game.players[0].buyin;
					game.balance = sum;
				});
			}
		};
		
		$scope.getAllGamesForPlayer = function() {
			console.log('Getting player with id (From modal window):', $scope.player.id);
			Model.fetchPlayer( $scope.player.id );
		};
		
		$scope.$on( 'player.fetched', function( event, playerFromDB ) {
			$scope.player = playerFromDB;
			$scope.calcBalance();
		} );

		$scope.ok = function() {
			$modalInstance.close($scope.player);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	} ] );