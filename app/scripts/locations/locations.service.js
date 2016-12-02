(function () {
  'use strict';

  class LocationsService {
    static get $inject() {
      return ['$q', 'Ref'];
    }

    constructor($q, Ref) {
      this.$q = $q;
      this.locationsRef = Ref.child('locations');
    }

    getAddress(locationName, communityId) {
      return this.$q.resolve(
        this.locationsRef
          .child(communityId)
          .child(locationName)
          .once('value')
          .then(snap => snap.val())
      );
    }
  }

  angular.module('pokerManager')
    .service('locationsSvc', LocationsService);
}());
