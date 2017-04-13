(function () {
  'use strict';

  class LocationsService {
    static get $inject() {
      return ['$q', 'Ref', 'firebaseCommon'];
    }

    constructor($q, Ref, firebaseCommon) {
      this.$q = $q;
      this.locationsRef = Ref.child('locations');
      this.firebaseCommon = firebaseCommon;
    }

    getAddress(locationName, communityId) {
      if (!locationName) {
        return this.$q.resolve('');
      }
      return this.firebaseCommon.getValue(`locations/${communityId}/${locationName}`);
    }

    getLocations(communityId) {
      return this.firebaseCommon.getValue(`locations/${communityId}`);
    }

    /**
     * Adds a new location
     * @param {string} communityId The community to save the location under
     * @param {Object} location The location to save
     * @return {Promise<Object>} A promise that resolves with the saved location
     */
    addLocation(communityId, location) {
      return this.$q.resolve(
        this.locationsRef
          .child(communityId)
          .child(location.name)
          .set(location.address)
          .then(() => location)
      );
    }
  }

  angular.module('pokerManager')
    .service('locationsSvc', LocationsService);
}());
