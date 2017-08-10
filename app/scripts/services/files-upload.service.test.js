(function () {
  'use strict';

  describe('files-upload.service', () => {
    let $q, $rootScope, filesUploadSvc;

    beforeEach(module('tmpls'));
    beforeEach(module('pokerManager'));
    beforeEach(() => {
      module($provide => {
        $provide.value('$window', () => window);
      });
      inject(function (_$q_, _$rootScope_, _filesUploadSvc_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        filesUploadSvc = _filesUploadSvc_;
      });
    });

    it('should upload file and resolve with a download URL', done => {
      const imgFile = { name: 'image-name.png' };
      filesUploadSvc.uploadImg({ uid: 'user-id', imgFile })
        .then(uploaded => {
          expect(uploaded).toContain(`user-id/profile_img.png`);
          done();
        });

      $rootScope.$digest();
    });
  });
}());
