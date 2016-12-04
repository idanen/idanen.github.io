(function () {
  'use strict';

  class FirebaseCommon {
    static get $inject() {
      return ['$q', 'Ref'];
    }
    constructor($q, Ref) {
      this.$q = $q;
      this.rootRef = Ref;
    }

    getValue(path) {
      return this.$q.resolve(
        this.rootRef
          .child(path)
          .once('value')
          .then(snap => snap.val())
      );
    }
  }

  angular.module('pokerManager')
    .service('firebaseCommon', FirebaseCommon);
}());
