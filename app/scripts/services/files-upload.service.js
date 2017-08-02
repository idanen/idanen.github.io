(function () {
  'use strict';

  class FilesUploadService {
    static get $inject() {
      return ['$q'];
    }

    constructor($q) {
      this.$q = $q;
      this.storageRef = firebase.storage().ref().child('images');
    }

    uploadImg({uid, imgFile} = {}) {
      const fileParts = imgFile.name.split('.');
      const fileSuffix = fileParts[fileParts.length - 1];
      return this.storageRef.child(`${uid}.${fileSuffix}`).put(imgFile)
        .then(snapshot => snapshot.downloadURL);
    }
  }

  angular.module('pokerManager')
    .service('filesUploadSvc', FilesUploadService);
}());
