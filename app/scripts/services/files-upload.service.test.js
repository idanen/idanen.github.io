(function () {
  'use strict';

  describe('files-upload.service', () => {
    beforeEach(() => {
      module('pokerManager');
      module($provide => {
        $provide.value('$window', () => window);
      });
    });

    it('should upload file and resolve with a download URL', () => {

    });
  });
}());
