/* Controllers */
(function () {
  'use strict';
  angular.module('pokerManager.controllers', ['pokerManager.services'])
    .controller('MainCtrl', MainController);

  MainController.$inject = ['$scope', '$location', '$state', 'userService', 'communitiesSvc'];
  function MainController($scope, $location, $state, userService, communitiesSvc) {
    var vm = this,
        DAY = 1000 * 60 * 60 * 24,
        adminTab = {
          title: 'Current Game',
          href: '#/game/0',
          icon: 'icon-spades'
        },
        communitiesTab = {
          title: 'communities',
          icon: 'fa-users',
          children: [],
          actions: [{
            title: 'Add or join'
          }]
        },
        statsTab = {
          title: 'Stats',
          href: $state.href('stats', {fromDate: Date.now() - DAY * 30, toDate: Date.now()}),
          icon: 'fa-bar-chart'
        };

    vm.tabs = [];

    vm.hasChildren = hasChildren;
    vm.hasActions = hasActions;
    vm.signOut = signOut;

    vm.getLocation = function () {
      return $location.path();
    };
    vm.setLocation = function (location) {
      $location.path(location);
    };

    vm.isTabSelected = function (tabHref) {
      var pathRoot, tabHrefRoot;

      if (!tabHref) {
        return false;
      }

      pathRoot = $location.path().split('/')[1];
      tabHrefRoot = tabHref.split('/')[1];
      return pathRoot === tabHrefRoot;
    };

    vm.isAdmin = function () {
      return !!userService.getUser();
    };

    $scope.$watch(function () {
      return vm.isAdmin();
    }, function (newVal) {
      var adminTabIdx;

      if (newVal && vm.tabs.indexOf(adminTab) === -1) {
        vm.tabs.push(adminTab);
      } else {
        adminTabIdx = vm.tabs.indexOf(adminTab);
        if (adminTabIdx > -1) {
          vm.tabs.splice(adminTabIdx, 1);
        }
      }
    });

    $scope.$watch(function () {
      return userService.getUser();
    }, function (currentUser) {
      if (!currentUser) {
        return;
      }
      vm.currentUser = currentUser;
      if (vm.currentUser.communitiesIds && vm.currentUser.communitiesIds.length) {
        communitiesTab.children = [];
        communitiesSvc.getCommunitiesByIds(vm.currentUser.communitiesIds)
          .then(function (communities) {
            _.forEach(communities, function (community) {
              communitiesTab.children.push({
                title: community.name,
                href: $state.href('community', {communityId: community.$id})
              });
            });
          });
      }
    }, true);

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (toParams.communityId) {
        statsTab.href = $state.href('stats', {
          communityId: toParams.communityId,
          fromDate: Date.now() - DAY * 30,
          toDate: Date.now()
        });
      }
    });

    vm.init = function () {
      vm.tabs.push(communitiesTab);
      vm.tabs.push(statsTab);
      if (vm.isAdmin()) {
        vm.tabs.push(adminTab);
      }
    };

    function hasChildren(tab) {
      return tab.children && tab.children.length;
    }

    function hasActions(tab) {
      return tab.actions && tab.actions.length;
    }

    function signOut() {
      userService.logout();
      delete vm.currentUser;
    }
  }
}());
