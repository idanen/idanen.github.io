(function () {
  'use strict';

  angular.module('pokerManager')
    .config(config)
    .run(run);

  config.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
  function config($locationProvider, $stateProvider, $urlRouterProvider) {
    const home = {
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
            community: communityResolver
          }
        },
        communityPlayers = {
          name: 'communityPlayers',
          parent: 'community',
          url: '^/community/:communityId/players',
          templateUrl: 'scripts/players/community-players.view.html',
          controller: 'CommunityPlayersCtrl',
          controllerAs: '$ctrl',
          resolve: {
            community: communityResolver
          }
        },
        joinCommunity = {
          name: 'joinCommunity',
          parent: 'home',
          url: '^/join-community/:communityId?:joinCode',
          templateUrl: 'scripts/join-community/join-community.view.html',
          controller: 'JoinCommunityCtrl',
          controllerAs: '$ctrl'
        },
        userprofile = {
          name: 'userprofile',
          parent: 'home',
          url: '^/user/:uid',
          templateUrl: 'scripts/user-profile/user-profile.view.html',
          controller: 'UserProfileCtrl',
          controllerAs: '$ctrl'
        },
        // http://www.sitepoint.com/creating-stateful-modals-angularjs-angular-ui-router/
        addCommunity = {
          name: 'addCommunity',
          parent: 'home',
          onEnter: newCommunityModal,
          resolve: {
            previousState: previousStateResolver
          }
        },
        rsvp = {
          name: 'rsvp',
          parent: 'community',
          url: '/rsvp',
          component: 'rsvpView',
          resolve: {
            currentUser: currentUserResolver,
            communityId: communityIdResolver
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
            game: gameRouteResolver
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
          onEnter: PlayerState,
          resolve: {
            previousState: previousStateResolver
          }
        };

    $locationProvider.html5Mode(true);

    $stateProvider.state(home);
    $stateProvider.state(community);
    $stateProvider.state(communityPlayers);
    $stateProvider.state(joinCommunity);
    $stateProvider.state(userprofile);
    $stateProvider.state(addCommunity);
    $stateProvider.state(rsvp);
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
        // console.log('error %s trying to change state from $o to %o', error, fromState, toState);
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

  currentUserResolver.$inject = ['userService'];
  function currentUserResolver(userService) {
    return userService.waitForUser()
      .catch(err => console.error(err));
  }

  gameRouteResolver.$inject = ['$stateParams', 'Games'];
  function gameRouteResolver($stateParams, Games) {
    return Games.getGame($stateParams.gameId);
  }

  PlayerState.$inject = ['$stateParams', '$state', 'Players', 'playerModal', 'previousState'];
  function PlayerState($stateParams, $state, Players, playerModal, previousState) {
    var player = Players.getPlayer($stateParams.playerId);
    playerModal.open(player)
      .finally(function () {
        if (_.isFunction(player.$destroy)) {
          player.$destroy();
        }
        $state.go(previousState.name, previousState.params)
          .catch(err => console.log('transition failed: ', err));
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
      .then(function () {
        $state.go(previousState.name, previousState.params);
      })
      .catch(function () {
        $state.go(previousState.name, previousState.params);
      });
  }
}());
