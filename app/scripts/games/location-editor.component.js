(function () {
  'use strict';

  angular.module('pokerManager')
    .component('locationEditor', {
      controller: LocationEditorController,
      bindings: {
        communityId: '<',
        selected: '<',
        onSelect: '&'
      },
      template: `
      <div class="location-editor">
        <vaadin-combo-box allow-custom-value label="Select Location"></vaadin-combo-box>
        <paper-input-container ng-show="$ctrl.newLocationName">
          <label>New location address</label>
          <input is="iron-input" name="newLocationAddress" ng-model="$ctrl.newLocationAddress">
        </paper-input-container>
        <paper-button raised ng-show="$ctrl.newLocationName"><span class="icon icon-add"></span>&nbsp;Save new</paper-button>
      </div>
      `
    });

  LocationEditorController.$inject = ['$element', '$scope', 'locationsSvc'];
  function LocationEditorController($element, $scope, locationsSvc) {
    this.$element = $element;
    this.$scope = $scope;
    this.locationsSvc = locationsSvc;
    this.picker = this.$element.find('vaadin-combo-box')[0];
    this.addBtn = this.$element.find('paper-button')[0];
  }

  LocationEditorController.prototype = {
    $postLink: function () {
      this.picker.addEventListener('value-changed', event => {
        this.$scope.$applyAsync(() => {
          this.onSelect({
            $event: {
              name: event.detail.value,
              address: this.locations[event.detail.value]
            }
          });
          if (!(event.detail.value in this.locations)) {
            this.newLocationName = event.detail.value;
          } else {
            this.newLocationName = '';
          }
        });
      });
      this.picker.addEventListener('custom-value-set', event => {
        if (event.detail && !(event.detail in this.locations)) {
          this.newLocationName = event.detail;
        }
      });
      this.addBtn.addEventListener('tap', this.saveNewLocation.bind(this));
    },

    $onChanges: function (changes) {
      if (changes && changes.communityId && changes.communityId.currentValue && changes.communityId.currentValue !== changes.communityId.previousValue) {
        this.getAndSetLocations();
      }

      this.picker.value = this.selected;
    },

    mapLocations: function (locationsObj) {
      return Object.keys(locationsObj);
    },

    getAndSetLocations: function () {
      this.locationsSvc.getLocations(this.communityId)
        .then(locations => {
          this.locations = locations;
          return this.locations;
        })
        .then(this.mapLocations.bind(this))
        .then(this.setLocations.bind(this));
    },

    setLocations: function (locationItems) {
      this.picker.items = locationItems;
    },

    saveNewLocation: function () {
      if (!this.newLocationAddress || !this.newLocationName) {
        return;
      }

      return this.locationsSvc.addLocation(this.communityId, {
        name: this.newLocationName,
        address: this.newLocationAddress
      })
        .then(this.getAndSetLocations.bind(this))
        .then(() => {
          this.picker.value = this.newLocationName;
          this.newLocationName = '';
          this.newLocationAddress = '';
        })
        .catch(err => console.log('Error saving location: ', err));
    }
  };
}());

