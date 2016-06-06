(function () {
  'use strict';

  angular.module('firebase.config', [])
    .constant('FBURL', 'https://fiery-heat-6939.firebaseio.com')
    .constant('FB_APIKEY', 'AIzaSyDMrP9xSV8woT6-lt-TBiyMkSy0r3EiHAs')
    .constant('SIMPLE_LOGIN_PROVIDERS', ['password', 'anonymous', 'facebook', 'google'])
    .constant('GOOGLE_AUTH_SCOPES', ['profile', 'email', 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'])
    .constant('loginRedirectPath', '/login')
    .config(firebaseConfig);

  firebaseConfig.$inject = ['$windowProvider', 'FBURL', 'FB_APIKEY'];
  function firebaseConfig($windowProvider, FBURL, FB_APIKEY) {
    // Initialize Firebase
    var config = {
      apiKey: FB_APIKEY,
      authDomain: 'fiery-heat-6939.firebaseapp.com',
      databaseURL: FBURL,
      storageBucket: 'fiery-heat-6939.appspot.com'
    };
    $windowProvider.$get().firebase.initializeApp(config);
  }
}());
