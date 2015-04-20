/*
 * angular-google-plus-directive v0.0.1
 * ♡ CopyHeart 2013 by Jerad Bitner http://jeradbitner.com
 * Copying is an act of love. Please copy.
 */

angular.module('directive.g+signin', []).
  directive('googlePlusSignin', ['$window', function ($window) {
    'use strict';
    var ending = /\.apps\.googleusercontent\.com$/;

    return {
      restrict: 'E',
      transclude: true,
      template: '<span></span>',
      replace: true,
      link: function (scope, element, attrs, ctrl, linker) {
        attrs.clientid += (ending.test(attrs.clientid) ? '' : '.apps.googleusercontent.com');

        attrs.$set('data-clientid', attrs.clientid);

        // Some default values, based on prior versions of this directive
        var defaults = {
          callback: 'signinCallback',
          cookiepolicy: 'single_host_origin',
          requestvisibleactions: 'http://schemas.google.com/AddActivity',
          scope: 'profile email https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
          width: 'wide'
        };

        defaults.clientid = attrs.clientid;

        // Overwrite default values if explicitly set
        angular.forEach(Object.getOwnPropertyNames(defaults), function (propName) {
          if (attrs.hasOwnProperty(propName)) {
            defaults[propName] = attrs[propName];
          }
        });

        // Default language
        // Supported languages: https://developers.google.com/+/web/api/supported-languages
        attrs.$observe('language', function (value) {
          $window.___gcfg = {
            lang: value ? value : 'en'
          };
        });

        linker(function(el, tScope) {
          var scriptElement = document.getElementsByTagName('script')[0],
              scriptsParent = scriptElement.parentNode,
              observer = new MutationObserver(function () {
                observer.disconnect();
                document.querySelector( 'script[src="https://apis.google.com/js/client:platform.js"]' ).onload = function() {
                  if (el.length) {
                    element.append(el);
                  }
                  gapi.signin.render(element[0], defaults);
                };
              });

          observer.observe(scriptsParent, {
            childList: true
          });
        });
      }
    }
}]).
  run(['$window', '$rootScope', function( $window, $rootScope ) {
    $window.signinCallback = function (authResult) {
      if (authResult && authResult.access_token){
        $rootScope.$broadcast('event:google-plus-signin-success', authResult);
      } else {
        $rootScope.$broadcast('event:google-plus-signin-failure', authResult);
      }
    }; 
}]);
