(function () {
	'use strict';
/**
 * Players services
 */
angular.module( 'pokerManager' ).
	provider( 'Players',  PlayersProvider );

    PlayersProvider.$inject = [];
	function PlayersProvider() {

		var baseUrl = '',
			provider = this;

		provider.setBaseUrl = function ( aBaseUrl ) {
			baseUrl = aBaseUrl;
		};

		provider.$get = PlayersService;

		PlayersService.$inject = [ '$resource', '$filter', '$q', 'Ref', '$firebaseArray' ];

		function PlayersService( $resource, $filter, $q, Ref, $firebaseArray ) {
            var service = {
                create: create,
                save: save,
                findBy: findBy,
                matchUserToPlayer: matchUserToPlayer,
                players: $firebaseArray( Ref.child( 'players' ) )
            };

            service.fetchedPlayers = function () {
                return service.players;
            };

            function create() {
                return {
                    name: '',
                    balance: 0,
                    isPlaying: false,
                    buyin: 0,
                    currentChipCount: 0,
                    email: '',
                    phone:'',
                    id: 0,
                    createDate: new Date(),
                    isNew: true
                };
            }

            function save( player ) {
                var toSave = preSave( player );
            }

            function preSave( player ) {
                var clone = angular.extend( {}, player );
                delete clone.currentChipCount;
                delete clone.id;
                delete clone.isNew;

                clone.createDate = player.createDate.getTime();

                return clone;
            }

            function findBy( field, value ) {
                return $q( function ( resolve ) {
                    service.players.$ref().off('child_added');
                    service.players.$ref()
                        .orderByChild( field )
                        .equalTo( value )
                        .on( 'child_added', resolve );
                } );
            }

            function matchUserToPlayer( user ) {
                return findBy( 'email', user.email )
                    .then(addUser);

                function addUser( player ) {
                    var userToMatch = {},
                        idx = service.players.$indexFor( player.key() );

                    // Stop listening
                    service.players.$ref().off('child_added');

                    userToMatch[user.uid] = true;

                    if ( idx !== -1 ) {
                        service.players[ idx ].user = userToMatch;
                        service.players.$save( idx );
                    } else {
                        var newPlayer = preSave( create() );
                        newPlayer.user = userToMatch;
                        newPlayer.name = user.name;
                        newPlayer.email = user.email;
                        service.players.$add( newPlayer )
                            .catch(function ( error ) {
                                console.log( error );
                            } );
                    }
                }
            }

			return service;
		}
	}
})();
