/**
 * Interceptor to send users to login when not authenticated
 */
angular.module( 'pokerManager.services' )
    .factory( 'authInterceptor', [ '$q', 'toaster', 'Utils', function authInterceptorFactory( $q, toaster, utils ) {
        return {
            request: function ( config ) {
                if ( utils.getToken() ) {
                    config.headers.Authorization = utils.getToken();
                }
                return config;
            },
            response: function ( response ) {
                if ( response.data && response.data.authToken ) {
                    utils.saveToken( response.data.authToken );
                }
                return response;
            },
            responseError: function ( response ) {
                if ( response.status === 401 ) {
                    // TODO(idan): configure location, animation
                    toaster.error( 'Login required', 'This action requires login' );
                }
                return $q.reject( response );
            }
        };
    } ] );