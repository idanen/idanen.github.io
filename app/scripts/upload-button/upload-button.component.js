(function () {
  'use strict';

  angular.module('pokerManager')
    .component('uploadButton', {
      controller: UploadButtonController,
      bindings: {
        onChange: '&'
      },
      template: `
        <form name="upload-button-form" class="upload-button">
          <paper-button raised>Upload profile image</paper-button>
          <input type="file" accept="image/*">
          <div class="upload-button__message text-danger">{{$ctrl.errorMsg}}</div>
        </form>
      `
    });

  UploadButtonController.$inject = ['$element', '$scope'];
  function UploadButtonController($element, $scope) {
    this.$element = $element;
    this.$scope = $scope;
  }

  UploadButtonController.prototype = {
    $onInit: function () {
      this.fileInput = this.$element.find('input[type=file]')[0];
      this.listeners = [
        {
          event: 'tap',
          element: this.$element.find('paper-button')[0],
          listener: this.focusFileInput.bind(this)
        },
        {
          event: 'change',
          element: this.$element.find('input[type=file]')[0],
          listener: event => {
            this.$scope.$applyAsync(() => {
              this._handleFiles(event.target);
            });
          }
        }
      ];
    },

    $postLink: function () {
      this.listeners.forEach(toAttach => {
        toAttach.element.addEventListener(toAttach.event, toAttach.listener);
      });
      this.fileInput.setCustomValidity(this.fileInput.files.length && this.fileInput.files[0].size > (5 * 1024) ? 'file too big' : '');
    },

    $destroy: function () {
      this.listeners.forEach(toDettach => {
        toDettach.element.removeEventListener(toDettach.event, toDettach.listener);
      });
    },

    focusFileInput: function () {
      this.fileInput.click();
    },

    _handleFiles: function (inputElement) {
      const {files} = inputElement;
      if (!files || !files.length) {
        this.errorMsg = 'No files selected';
        inputElement.setCustomValidity(this.errorMsg);
      }
      const allowedSize = 500 * 1024;
      if (files[0].size <= allowedSize) {
        this.errorMsg = '';
        this.onChange({
          $event: {
            file: files[0]
          }
        });
      } else {
        this.errorMsg = `File is too large (max allowed: ${allowedSize / 1024}KB)`;
        inputElement.setCustomValidity(this.errorMsg);
      }
    }
  };
}());
