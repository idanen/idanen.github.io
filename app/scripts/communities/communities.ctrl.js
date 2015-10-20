(function () {
    angular
        .module( 'pokerManager' )
        .controller( 'CommunitiesCtrl', CommunitiesController );

    CommunitiesController.$inject = [ 'communitiesSvc', 'userService', 'Players', 'playerModal', 'Games', 'Ref', '$location' ];
    function CommunitiesController( communitiesSvc, userService, Players, playerModal, Games, Ref, $location ) {
        var vm = this,
            collapseState = {};

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

        vm.communities.$loaded().then( function () {
            vm.communities.forEach( function ( community ) {
                collapseState[ community.$id ] = true;
            } );
        } );

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
                    $location.url('/game/' + (game.$id || '0'));
                });
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
