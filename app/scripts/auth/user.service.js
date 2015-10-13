(function () {
    angular
        .module( 'pokerManager.services' )
        .service( 'userService', UserService );

    UserService.$inject = [ '$q', 'Auth', 'GOOGLE_AUTH_SCOPES' ];
    function UserService( $q, Auth, GOOGLE_AUTH_SCOPES ) {
        var service = this;

        service.login = login;
        service.logout = logout;
        service.save = save;
        service.getUser = getUser;

        function login( provider ) {
            return Auth.$authWithOAuthPopup(provider || 'google', {
                    rememberMe: true,
                    scope: GOOGLE_AUTH_SCOPES
                })
                .then(save);
        }

        function logout() {
            Auth.$unauth();
            delete service.user;
        }

        function save() {
            return $q.when( Auth.$requireAuth() )
                .then(function ( user ) {
                    service.user = user;
                    return service.user;
                });
        }

        function getUser() {
            return service.user;
        }
    }
}());
