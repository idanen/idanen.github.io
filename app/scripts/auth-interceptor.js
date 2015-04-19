/**
 * Interceptor to send users to login when not authenticated
 */
angular.module( 'pokerManager.services' )
    .factory( 'authInterceptor', [ '$q', '$location', 'Utils', function authInterceptorFactory( $q, $location, utils ) {
        return {
            response: function ( response ) {
                utils.saveToken( response.key );
                return response;
            },
            responseError: function ( response ) {
                if ( response.status === 401 ) {
                    $location.path( '/login' );
                }
                return $q.reject( response );
            }
        };
    } ] );