(function () {
    angular
        .module('pokerManager.services')
        .service('communities', CommunitiesService);

    CommunitiesService.$inject = ['Ref', '$firebaseArray'];
    function CommunitiesService(Ref, $firebaseArray) {
        var service = this;

        service.communities = $firebaseArray(Ref.child('communities'));
    }
}());
