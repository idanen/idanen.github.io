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
          controllerAs: 'vm',
          resolve: {
            communities: communitiesResolver
          }
        },
        community = {
          name: 'community',
          parent: 'home',
          url: '^/community/:communityId',
          templateUrl: 'scripts/communities/communities.view.html',
          controller: 'CommunitiesCtrl',
          controllerAs: 'vm',
          resolve: {
            communityId: communityIdResolver,
            community: communityResolver,
            players: communityPlayersResolver,
            user: authRequiredResolver
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
          controllerAs: 'vm'
        },
        player = {
          name: 'player',
          parent: 'community',
          url: '/player/:playerId',
          onEnter: PlayerState
        };

    $stateProvider.state(home);
    $stateProvider.state(community);
    $stateProvider.state(gameManager);
    $stateProvider.state(stats);
    $stateProvider.state(player);

    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
  }

  run.$inject = ['$rootScope', 'PolymerToaster'];
  function run($rootScope, PolymerToaster) {
    var unwatch = $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      console.log('error %s trying to change state from $o to %o', error, fromState, toState);
      if (error === 'AUTH_REQUIRED') {
        PolymerToaster.showToast();
      }
    });

    $rootScope.$on('$destroy', function () {
      unwatch();
    });
  }

  // waitForAuthResolver.$inject = ['userService'];
  // function waitForAuthResolver(userService) {
  //   return userService.save();
  // }

  authRequiredResolver.$inject = ['Auth'];
  function authRequiredResolver(Auth) {
    return Auth.$requireAuth();
  }

  communitiesResolver.$inject = ['communitiesSvc'];
  function communitiesResolver(communitiesSvc) {
    return communitiesSvc.communities;
  }

  communityResolver.$inject = ['communitiesSvc', '$stateParams'];
  function communityResolver(communitiesSvc, $stateParams) {
    return communitiesSvc.communities.$loaded()
      .then(function () {
        return communitiesSvc.communities.$getRecord($stateParams.communityId);
      });
  }

  communityIdResolver.$inject = ['$stateParams'];
  function communityIdResolver($stateParams) {
    return $stateParams.communityId;
  }

  communityPlayersResolver.$inject = ['Players', 'community'];
  function communityPlayersResolver(Players, community) {
    return Players.playersOfCommunity(community);
  }

  gameRouteResolver.$inject = ['$stateParams', '$firebaseObject', 'Ref'];
  function gameRouteResolver($stateParams, $firebaseObject, Ref) {
    return $firebaseObject(Ref.child('game/' + $stateParams.gameId));
  }

  playersRouteResolver.$inject = ['communityId', 'Players', 'communitiesSvc'];
  function playersRouteResolver(communityId, Players, communitiesSvc) {
    var community = communitiesSvc.communities.$getRecord(communityId);
    return Players.playersOfCommunity(community);
  }

  PlayerState.$inject = ['$stateParams', '$state', 'Players', 'playerModal'];
  function PlayerState($stateParams, $state, Players, playerModal) {
    var player = Players.getPlayer($stateParams.playerId);
    playerModal.open(player)
      .finally(function () {
        $state.go('^');
      });
  }
}());
