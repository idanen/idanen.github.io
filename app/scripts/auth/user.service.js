(function () {
    angular
        .module( 'pokerManager.services' )
        .service( 'userService', UserService );

    UserService.$inject = [ '$q', 'Auth', 'Ref', '$firebaseObject', 'GOOGLE_AUTH_SCOPES' ];
    function UserService( $q, Auth, Ref, $firebaseObject, GOOGLE_AUTH_SCOPES ) {
        var service = this,
            users = $firebaseObject( Ref.child( 'users' ) );

        service.login = login;
        service.logout = logout;
        service.save = save;
        service.getUser = getUser;

        function login( provider ) {
            return Auth.$authWithOAuthPopup(provider || 'google', {
                    remember: 'default',
                    scope: GOOGLE_AUTH_SCOPES
                })
                .then(save);
        }

        function logout() {
            Auth.$unauth();
            delete service.user;
        }

        function save() {
            return $q.when( Auth.$waitForAuth() )
                .then(function ( user ) {
                    service.user = user;
                    users[user.uid] = user;
                    return service.user;
                });
        }

        function getUser() {
            return service.user;
        }
    }
}());
