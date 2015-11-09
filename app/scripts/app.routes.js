(function () {
    'use strict';

    angular.module('pokerManager')
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
        $stateProvider.state({
            name:'home',
            url: '/',
            templateUrl: 'scripts/home/home.view.html',
            controller: 'HomeCtrl',
            controllerAs: 'vm',
            resolve: {
                communities: communitiesResolver
            }
        });
        $stateProvider.state({
            name: 'community',
            parent: 'home',
            url: '^/community/:communityId',
            templateUrl: 'scripts/communities/communities.view.html',
            controller: 'CommunitiesCtrl',
            controllerAs: 'vm',
            resolve: {
                communityId: communityIdResolver,
                community: communityResolver,
                players: communityPlayersResolver
            }
        });
        $stateProvider.state({
            name: 'game',
            parent: 'community',
            url: '/games/:gameId',
            templateUrl: 'scripts/games/games.view.html',
            controller: 'PokerManagerCtrl',
            controllerAs: 'vm',
            resolve: {
                game: gameRouteResolver
            }
        });
        $stateProvider.state({
            name: 'players',
            parent: 'community',
            url: '/players',
            templateUrl: 'scripts/players/players.view.html',
            controller: 'PlayersCtrl',
            controllerAs: 'vm',
            resolve: {
                players: playersRouteResolver
            }
        });
        $stateProvider.state({
            name: 'stats',
            parent: 'community',
            url: '/stats?fromDate&toDate',
            templateUrl: 'partials/poker-stats.html',
            controller: 'PokerStatsCtrl',
            controllerAs: 'vm'
        });

        //$urlRouterProvider.otherwise('/home');
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.when('/community', '/community/:communityId');
    }

    run.$inject = ['$rootScope'];
    function run($rootScope) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.log(error);
        });
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
}());
