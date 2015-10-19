(function () {
    angular
        .module('pokerManager')
        .service('communitiesSvc', CommunitiesService);

    CommunitiesService.$inject = ['Ref', '$firebaseArray'];
    function CommunitiesService(Ref, $firebaseArray) {
        var service = this,
            selectedCommunityIdx = 0;

        service.communities = $firebaseArray(Ref.child('communities'));

        service.setSelectedCommunity = function ( idx ) {
            selectedCommunityIdx = idx;
        };

        service.getSelectedCommunity = function () {
            return service.communities[ selectedCommunityIdx ];
        };
    }
}());
