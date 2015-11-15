(function () {
    angular
        .module( 'pokerManager' )
        .controller( 'CommunitiesCtrl', CommunitiesController );

    CommunitiesController.$inject = [ 'communitiesSvc', 'userService', 'Players', 'playerModal', 'Games', 'Ref', '$state', '$location', 'community', 'players' ];
    function CommunitiesController( communitiesSvc, userService, Players, playerModal, Games, Ref, $state, $location, community, players ) {
        var vm = this,
            collapseState = {};

        vm.prefs = {
            playersOpen: false
        };

        vm.fromDate = Date.now() - (1000 * 60 * 60 * 24 * 30);
        vm.toDate = Date.now();
        vm.openPlayersControl = openPlayersControl;
        vm.community = community;
        vm.players = players;
        vm.newCommunity = '';
        vm.inputDisabled = false;
        vm.communityDropdownOpen = false;
        vm.communities = communitiesSvc.communities;
        vm.add = add;
        vm.isCollapsed = isCollapsed;
        vm.toggleCollapsed = toggleCollapsed;
        vm.communitiesDropdownToggle = communitiesDropdownToggle;
        vm.userUid = userService.getUser() && userService.getUser().uid;
        vm.addMember = addMember;
        vm.createGame = createGame;
        vm.getCommunityGames = getCommunityGames;
        vm.loadStats = loadStats;

        vm.communities.$loaded().then( function () {
            vm.communities.forEach( function ( community ) {
                collapseState[ community.$id ] = true;
                vm.getCommunityGames( community );
            } );
        } );

        function openPlayersControl() {
            vm.prefs.playersOpen = !vm.prefs.playersOpen;
        }

        function loadStats() {
            $state.go('stats', {communityId: community.$id, fromDate: vm.fromDate, toDate: vm.toDate});
        }

        function add() {
            var community = {},
                user = userService.getUser();
            if ( vm.newCommunity ) {
                community.name = vm.newCommunity;
                vm.communities.$add( community )
                    .then( function ( ref ) {
                        collapseState[ref.key()] = false;
                        Players.findBy( 'userUid', user.uid ).then( function ( playerSnapshot ) {
                            var membership = {},
                                playerUid = playerSnapshot.key(),
                                player = playerSnapshot.val(),
                                admins = {};
                            membership[ref.key()] = vm.newCommunity;
                            playerSnapshot.ref().child( 'memberIn' ).set( membership );

                            admins[playerUid] = player.name;
                            ref.child( 'admins' ).set( admins );
                            ref.child( 'members' ).set( admins );

                            vm.newCommunity = '';
                        } );
                    } )
                    .finally( function () {
                        vm.inputDisabled = false;
                    } );
            }
        }

        function join() {
            //userService
        }

        function addMember( community ) {
            playerModal.open()
                .then( function ( player ) {
                    return Players.save( player );
                } )
                .then( function ( savedPlayer ) {
                    var idx = vm.communities.$indexFor( community.$id ),
                        membership = {};

                    membership[ community.$id ] = community.name;
                    if ( idx !== -1 ) {
                        savedPlayer.once( 'value', function ( snap ) {
                            vm.communities[ idx ].members[ snap.key() ] = snap.child( 'name' ).val();
                            vm.communities.$save( idx );
                        } );
                        Ref.child( 'players/' + savedPlayer.key() ).child( 'memberIn' ).set( membership );
                    }
                } );
        }

        function createGame(community) {
            return Games.newGame(community.$id)
                .then(function (game) {
                    $state.go('game', {communityId: community.$id, gameId: game.$id});
                });
        }

        function getCommunityGames( community ) {
            Games.findBy( 'communityId', community.$id )
                .then( function ( games ) {
                    community.games = games;
                } );
        }

        function isCollapsed( communityId ) {
            return collapseState[communityId];
        }

        function toggleCollapsed( communityId ) {
            collapseState[communityId] = !collapseState[communityId];
        }

        function communitiesDropdownToggle() {
            vm.communityDropdownOpen = !vm.communityDropdownOpen;
        }
    }
}());
