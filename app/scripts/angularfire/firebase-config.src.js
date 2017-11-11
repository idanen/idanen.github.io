
(function (fbConfig) {
  'use strict';

  angular.module('firebase.config.file', [])
    .config(firebaseConfig);

  firebaseConfig.$inject = ['$windowProvider'];
  function firebaseConfig($windowProvider) {
    // Initialize Firebase
    $windowProvider.$get().firebase.initializeApp(fbConfig);
  }
  // eslint-disable-next-line no-inline-comments
}(/* REPLACED_BY_BUILD */));
