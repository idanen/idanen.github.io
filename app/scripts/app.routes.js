(function () {
  'use strict';

  angular.module('pokerManager')
    .config(config)
    .run(run);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];
  function config($stateProvider, $urlRouterProvider) {
    var home = {
          name: 'home',
          url: '/',
          templateUrl: 'scripts/home/home.view.html',
          controller: 'HomeCtrl',
          controllerAs: 'vm'
        },
        community = {
          name: 'community',
          parent: 'home',
          url: '^/community/:communityId',
          templateUrl: 'scripts/communities/communities.view.html',
          controller: 'CommunitiesCtrl',
          controllerAs: 'vm',
          resolve: {
            community: communityResolver,
            user: authRequiredResolver
          }
        },
        // TODO (idan): build the add/join community state with modals by
        // http://www.sitepoint.com/creating-stateful-modals-angularjs-angular-ui-router/
        addCommunity = {
          name: 'addCommunity',
          parent: 'home',
          onEnter: newCommunityModal,
          resolve: {
            previousState: previousStateResolver
          }
        },
        gameManager = {
          name: 'game',
          parent: 'community',
          url: '/games/:gameId',
          templateUrl: 'scripts/games/games.view.html',
          controller: 'PokerManagerCtrl',
          controllerAs: 'vm',
          resolve: {
            game: gameRouteResolver,
            user: authRequiredResolver
          }
        },
        stats = {
          name: 'stats',
          parent: 'community',
          url: '/stats?{fromDate:int}&{toDate:int}',
          templateUrl: 'partials/poker-stats.html',
          controller: 'PokerStatsCtrl',
          controllerAs: 'vm',
          resolve: {
            user: authRequiredResolver
          }
        },
        player = {
          name: 'player',
          parent: 'community',
          url: '/player/:playerId',
          onEnter: PlayerState
        };

    $stateProvider.state(home);
    $stateProvider.state(community);
    $stateProvider.state(addCommunity);
    $stateProvider.state(gameManager);
    $stateProvider.state(stats);
    $stateProvider.state(player);

    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
  }

  run.$inject = ['$rootScope', 'polymerToaster'];
  function run($rootScope, polymerToaster) {
    var unwatch = $rootScope.$on('$stateChangeError',
      function (event, toState, toParams, fromState, fromParams, error) {
        console.log('error %s trying to change state from $o to %o', error, fromState, toState);
        if (error === 'AUTH_REQUIRED') {
          polymerToaster.loginRequiredToast();
        }
      });

    $rootScope.$on('$destroy', unwatch);
  }

  // waitForAuthResolver.$inject = ['userService'];
  // function waitForAuthResolver(userService) {
  //   return userService.save();
  // }

  authRequiredResolver.$inject = ['$firebaseAuth'];
  function authRequiredResolver($firebaseAuth) {
    return $firebaseAuth().$requireSignIn();
  }

  communitiesResolver.$inject = ['communitiesSvc'];
  function communitiesResolver(communitiesSvc) {
    return communitiesSvc.getCommunities();
  }

  communityResolver.$inject = ['communitiesSvc', '$stateParams'];
  function communityResolver(communitiesSvc, $stateParams) {
    return communitiesSvc.getCommunity($stateParams.communityId);
  }

  communityIdResolver.$inject = ['$stateParams'];
  function communityIdResolver($stateParams) {
    return $stateParams.communityId;
  }

  gameRouteResolver.$inject = ['$stateParams', 'Games'];
  function gameRouteResolver($stateParams, Games) {
    return Games.getGame($stateParams.gameId);
  }

  PlayerState.$inject = ['$stateParams', '$state', 'Players', 'playerModal'];
  function PlayerState($stateParams, $state, Players, playerModal) {
    var player = Players.getPlayer($stateParams.playerId);
    playerModal.open(player)
      .finally(function () {
        $state.go('^');
      });
  }

  previousStateResolver.$inject = ['$state'];
  function previousStateResolver($state) {
    return {
      name: $state.current.name,
      params: $state.params
    };
  }

  newCommunityModal.$inject = ['$state', '$uibModal', 'previousState'];
  function newCommunityModal($state, $uibModal, previousState) {
    return $uibModal.open({
      templateUrl: './partials/modals/addNewPlayer.html',
      controller: 'CommunitySimpleCtrl',
      controllerAs: '$ctrl',
      bindToController: true
    }).result
      .then(function (community) {
        console.log('Successfully added a new community ', community);
        $state.go(previousState.name, previousState.params);
      })
      .catch(function (reason) {
        console.log('New community modal dismissed with reason: ' + reason);
        $state.go(previousState.name, previousState.params);
      });
  }
}());
