(function () {
    angular
        .module( 'pokerManager' )
        .controller( 'CommunitiesCtrl', CommunitiesController );

    CommunitiesController.$inject = [ 'communitiesSvc', 'userService', 'Ref' ];
    function CommunitiesController( communitiesSvc, userService, Ref ) {
        var vm = this,
            collapseState = {};

        vm.newCommunity = '';
        vm.inputDisabled = false;
        vm.communities = communitiesSvc.communities;
        vm.add = add;
        vm.isCollapsed = isCollapsed;
        vm.toggleCollapsed = toggleCollapsed;

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
                community.admins = {};
                community.members = {};
                community.admins[user.uid] = {
                    name: user[user.provider].displayName
                };
                community.members[user.uid] = {
                    name: user[user.provider].displayName
                };
                vm.communities.$add( community )
                    .then( function ( ref ) {
                        var membership = {};
                        membership[ref.key()] = {
                            name: vm.newCommunity
                        };
                        vm.newCommunity = '';
                        collapseState[ref.key()] = false;
                        Ref.child('player/' + user.uid).child('memberIn').set( membership );
                    } )
                    .finally( function () {
                        vm.inputDisabled = false;
                    } );
            }
        }

        function isCollapsed( communityId ) {
            return collapseState[communityId];
        }

        function toggleCollapsed( communityId ) {
            collapseState[communityId] = !collapseState[communityId];
        }
    }
}());
