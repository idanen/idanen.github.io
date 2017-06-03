(function () {
  'use strict';

  angular.module('firebase.config', ['firebase.config.file'])
    .constant('SIMPLE_LOGIN_PROVIDERS', ['password', 'anonymous', 'facebook', 'google'])
    .constant('GOOGLE_AUTH_SCOPES', ['profile', 'email', 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'])
    .constant('loginRedirectPath', '/login');
}());
