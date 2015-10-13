(function () {
    angular
        .module( 'pokerManager' )
        .controller( 'CommunitiesCtrl', CommunitiesController );

    CommunitiesController.$inject = [ 'communitiesSvc', 'userService', 'Ref' ];
    function CommunitiesController( communitiesSvc, userService, Ref ) {
        var vm = this;

        vm.newCommunity = '';
        vm.inputDisabled = false;
        vm.communities = communitiesSvc.communities;
        vm.add = add;

        function add() {
            var community = {},
                userUid = userService.getUser().uid;
            if ( vm.newCommunity ) {
                community.name = vm.newCommunity;
                community.admins = {};
                community.admins[userUid] = true;
                vm.communities.$add( community )
                    .then( function ( ref ) {
                        var membership = {};
                        vm.newCommunity = '';
                        membership[ref.key()] = true;
                        Ref.child('player/' + userUid).child('memberIn').set( membership );
                    } )
                    .finally( function () {
                        vm.inputDisabled = false;
                    } );
            }
        }
    }
}());
