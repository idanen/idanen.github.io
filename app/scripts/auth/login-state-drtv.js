/**
 * Created by entini on 25/04/2015.
 */

angular.module( 'pokerManager')
    .directive( 'loginState', [
        function () {
            'use strict';

            return {
                restrict: 'EA',
                controller: 'LoginCtrl',
                controllerAs: 'authCtrl',
                templateUrl: 'partials/tmpls/login-state-tmpl.html',
                link: function ( $scope, $element, $attrs, vm ) {

                }
            };
        }
    ] );
