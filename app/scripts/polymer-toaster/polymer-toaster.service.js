(function () {
  'use strict';

  angular.module('pokerManager')
    .service('PolymerToaster', PolymerToaster);

  PolymerToaster.$inject = ['$document'];
  function PolymerToaster($document) {
    this.toastTmpl = '<paper-toast duration="5000">You need to log in to proceed <login-state></login-state></paper-toast>';
    $document.find('body').append(this.toastTmpl);
    this.toastElement = $document.find('paper-toast')[0];
  }

  PolymerToaster.prototype = {
    showToast: function () {
      this.toastElement.hide();
      this.toastElement.show();
    }
  };
}());
