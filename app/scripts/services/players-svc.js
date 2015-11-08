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

		PlayersService.$inject = [ '$q', 'Ref', '$firebaseArray' ];

		function PlayersService( $q, Ref, $firebaseArray ) {
            var service = {
                create: create,
                save: save,
                playersOfCommunity: playersOfCommunity,
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
                    phone: '',
                    createDate: Date.now(),
                    isNew: true
                };
            }

            function save( player ) {
                delete player.isNew;
                return service.players.$add( player );
            }

            function playersOfCommunity( community ) {
                var playerIds = Object.keys( community.members ),
                    baseRef = Ref.child( 'players' ),
                    players = [];

                return $q(function (resolve) {
                    playerIds.forEach(function (playerId) {
                        baseRef.child(playerId).once('value', function (snap) {
                            var player = snap.val();
                            player.$id = player.id = snap.key();
                            players.push( player );

                            if (players.length === playerIds.length) {
                                resolve( players );
                            }
                        });
                    });
                });
            }

            function findBy( field, value, multi ) {
                return $q( function ( resolve ) {
                    service.players.$ref().off('value');
                    service.players.$ref()
                        .orderByChild( field )
                        .equalTo( value )
                        .on( 'value', function ( querySnapshot ) {
                            var result = multi ? [] : {};
                            if ( querySnapshot.hasChildren() ) {
                                querySnapshot.forEach( function ( playerSnap ) {
                                    if (multi) {
                                        result.push(playerSnap);
                                    } else {
                                        result = playerSnap;
                                    }
                                } );
                            }
                            resolve( result );
                        } );
                } );
            }

            function matchUserToPlayer( user ) {
                return findBy( 'email', user.email )
                    .then(addUser);

                function addUser( playerSnapshot ) {
                    var idx = -1;

                    // Stop listening
                    service.players.$ref().off( 'value' );

                    if ( playerSnapshot ) {
                        idx = service.players.$indexFor( playerSnapshot.key() );
                        if ( idx !== -1 ) {
                            service.players[ idx ].userUid = user.uid;
                            service.players.$save( idx );
                        }
                    } else {
                        var newPlayer = create();
                        newPlayer.userUid = user.uid;
                        newPlayer.name = user.name;
                        newPlayer.email = user.email;
                        newPlayer.imageUrl = user.imageUrl;
                        delete newPlayer.isNew;
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
