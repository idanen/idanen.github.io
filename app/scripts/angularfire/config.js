(function () {
  'use strict';

  angular.module('firebase.config', [])
    .constant('FBURL', 'https://fiery-heat-6939.firebaseio.com')
    .constant('SIMPLE_LOGIN_PROVIDERS', ['password', 'anonymous', 'facebook', 'google'])
    .constant('GOOGLE_AUTH_SCOPES', 'profile,email,https://www.googleapis.com/auth/plus.login,https://www.googleapis.com/auth/plus.profile.emails.read')
    .constant('loginRedirectPath', '/login');
}());
