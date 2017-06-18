(function () {
  'use strict';

  describe('join-community controller tests', () => {
    const playerId = 'fake-player-id';
    const userId = 'test-user-id';
    const communityId = 'test-community-id';
    const communityName = 'Test Community';
    const community = {
      $id: communityId,
      name: communityName
    };
    const communityPendingUser = Object.assign({}, community, {});
    const communitiesSvc = {
      getCommunity: jasmine.createSpy('getCommunity'),
      askToJoin: jasmine.createSpy('askToJoin')
    };
    const userSvc = {
      getUser: jasmine.createSpy('getUser'),
      onUserChange: jasmine.createSpy('onUserChange')
    };
    const polymerToaster = jasmine.createSpyObj('polymerToaster', ['showToast', 'loginRequiredToast', 'notificationToast']);
    const playersSvc = jasmine.createSpyObj('polymerToaster', ['joinCommunity', 'findBy']);
    const fakeUser = {
      uid: userId,
      displayName: 'Fake User',
      email: 'user@fake.com',
      photoURL: 'http://images.com/my-face.png',
      playerId
    };
    const joinedPlayer = Object.assign({}, fakeUser, {
      userUid: userId,
      membership: {
        [communityId]: {
          name: communityName,
          type: 'member'
        }
      }
    });
    const guestPlayer = Object.assign({}, fakeUser, {
      userUid: userId,
      membership: {
        [communityId]: {
          name: communityName,
          type: 'guest'
        }
      }
    });
    const somePlayer = Object.assign({}, fakeUser, {
      userUid: userId
    });
    let ctrl, $rootScope, $q;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(() => {
      inject(($controller, _$q_, _$state_, _$rootScope_) => {
        $q = _$q_;
        community.$loaded = () => $q.resolve();
        communitiesSvc.askToJoin.and.returnValue($q.resolve());
        communitiesSvc.getCommunity.and.returnValue(community);
        userSvc.getUser.and.returnValue($q.resolve(fakeUser));
        userSvc.onUserChange.and.callFake(fn => fn(fakeUser));
        $rootScope = _$rootScope_;

        ctrl = $controller('JoinCommunityCtrl', {
          '$state': _$state_,
          userService: userSvc,
          Players: playersSvc,
          polymerToaster,
          communitiesSvc,
          community
        });
      });
    });

    it('should have `approved` state `true` if user is already a member', () => {
      playersSvc.findBy.and.callFake((field, value) => {
        if (field === 'userUid' && value === fakeUser.uid) {
          return joinedPlayer;
        }
      });

      ctrl.userChanged(fakeUser);

      $rootScope.$digest();

      expect(ctrl.approved).toBeTruthy();
    });

    it('should have `approved` state `false` if user is a guest', () => {
      playersSvc.findBy.and.callFake((field, value) => {
        if (field === 'userUid' && value === fakeUser.uid) {
          return guestPlayer;
        }
      });

      ctrl.userChanged(fakeUser);

      $rootScope.$digest();

      expect(ctrl.approved).toBeFalsy();
    });

    it('should send join request', () => {
      const aJoinCode = 'test-join-code';
      const joinRequest = Object.assign({}, fakeUser, {
        communityId,
        joinCode: aJoinCode
      });
      playersSvc.findBy.and.callFake((field, value) => {
        if (field === 'userUid' && value === fakeUser.uid) {
          return $q.resolve(somePlayer);
        }
      });
      ctrl.joinCode = aJoinCode;
      ctrl.currentUser = fakeUser;

      ctrl.joinCommunity();

      expect(communitiesSvc.askToJoin).toHaveBeenCalledWith(joinRequest);

      $rootScope.$digest();

      expect(playersSvc.joinCommunity).toHaveBeenCalledWith(somePlayer, community, true);
    });
  });
}());
