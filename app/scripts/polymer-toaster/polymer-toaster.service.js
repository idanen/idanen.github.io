(function () {
  'use strict';

  angular.module('pokerManager')
    .service('polymerToaster', PolymerToaster);

  PolymerToaster.$inject = ['$document'];
  function PolymerToaster($document) {
    this.toastTmpl = '<paper-toast></paper-toast>';
    $document.find('body').append(this.toastTmpl);
    this.toastElement = $document.find('paper-toast')[0];
  }

  PolymerToaster.prototype = {
    showToast: function (options) {
      this.toastElement.hide();
      this.toastElement.show(options);
    },
    loginRequiredToast: function () {
      this.showToast({
        duration: 5000,
        text: 'You need to log in to proceed'
      });
    },
    notificationToast: function (text) {
      this.showToast({
        duration: 5000,
        text: text
      });
    }
  };
}());
