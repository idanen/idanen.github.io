(function () {
  'use strict';

  angular.module('firebase.config', [])
    .constant('FBURL', 'https://fiery-heat-6939.firebaseio.com')
    .constant('FB_APIKEY', 'AIzaSyDMrP9xSV8woT6-lt-TBiyMkSy0r3EiHAs')
    .constant('SIMPLE_LOGIN_PROVIDERS', ['password', 'anonymous', 'facebook', 'google'])
    .constant('GOOGLE_AUTH_SCOPES', ['profile', 'email', 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'])
    .constant('FIREBASE_CONFIG', {
      apiKey: 'AIzaSyDMrP9xSV8woT6-lt-TBiyMkSy0r3EiHAs',
      authDomain: 'fiery-heat-6939.firebaseapp.com',
      databaseURL: 'https://fiery-heat-6939.firebaseio.com',
      storageBucket: 'fiery-heat-6939.appspot.com'
    })
    .constant('loginRedirectPath', '/login')
    .config(firebaseConfig);

  firebaseConfig.$inject = ['$windowProvider', 'FIREBASE_CONFIG'];
  function firebaseConfig($windowProvider, FIREBASE_CONFIG) {
    // Initialize Firebase
    $windowProvider.$get().firebase.initializeApp(FIREBASE_CONFIG);
  }
}());
