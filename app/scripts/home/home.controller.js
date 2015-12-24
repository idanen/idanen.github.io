(function () {
  'use strict';

  angular.module('pokerManager')
    .controller('HomeCtrl', HomeController);

  HomeController.$inject = ['communities'];
  function HomeController(communities) {
    var vm = this;

    vm.communities = communities;
  }
}());
