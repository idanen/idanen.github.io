(function () {
    angular
        .module('pokerManager')
        .service('communitiesSvc', CommunitiesService);

    CommunitiesService.$inject = ['Ref', '$firebaseArray'];
    function CommunitiesService(Ref, $firebaseArray) {
        var service = this;

        service.communities = $firebaseArray(Ref.child('communities'));
    }
}());
