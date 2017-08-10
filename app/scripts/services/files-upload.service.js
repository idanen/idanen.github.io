(function (global) {
  'use strict';

  class FilesUploadService {
    static get $inject() {
      return ['$q'];
    }

    constructor($q) {
      this.$q = $q;
      this.storageRef = global.firebase.storage().ref().child('profile_images');
    }

    uploadImg({uid, imgFile} = {}) {
      const fileParts = imgFile.name.split('.');
      const fileSuffix = fileParts[fileParts.length - 1];
      return this.storageRef.child(`${uid}/profile_img.${fileSuffix}`).put(imgFile)
        .then(snapshot => snapshot.downloadURL);
    }
  }

  angular.module('pokerManager')
    .service('filesUploadSvc', FilesUploadService);
}(window));
