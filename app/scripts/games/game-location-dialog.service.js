(function () {
  'use strict';

  angular.module('pokerManager')
    .service('gameLocationDialogSvc', GameLocationDialogSvc);

  GameLocationDialogSvc.$inject = ['$document'];
  function GameLocationDialogSvc() {
    this.dialog = document.querySelector('#game-location-dialog');
    this.mapElement = this.dialog.querySelector('google-map');
    this.mapSearch = this.dialog.querySelector('google-map-search');
    this.mapsLink = this.dialog.querySelector('.address-link');

    this.mapElement.addEventListener('google-map-ready', this.register);

    this.addresses = ['עין דור 7 ראשון לציון', 'אלכסנדר פן 23 תל אביב', 'הצלע 5 רמת גן', 'הסולן 12 רעננה'];
  }

  GameLocationDialogSvc.prototype = {
    open: function (address) {
      this.dialog.open();
      this.mapSearch.map = this.mapElement.map;
      if (address) {
        this.markAddress(address);
      }
    },

    close: function () {
      this.dialog.close();
    },

    register: function () {
      this.mapSearch.map = this.mapElement.map;
    },

    markAddress: function (address) {
      let searchListener = e => {
        this.mapElement.latitude = e.detail[0].latitude;
        this.mapElement.longitude = e.detail[0].longitude;
        e.detail.forEach(result => {
          let marker = document.createElement('google-map-marker');
          marker.latitude = result.latitude;
          marker.longitude = result.longitude;
          marker.innerHTML = `<h3>${result.name}</h3>`;
          this.mapElement.appendChild(marker);
        });
        this.mapSearch.removeEventListener('google-map-search-results', searchListener);
        this.mapsLink.href = `http://maps.google.com/?q=${address}`;
      };
      this.mapElement.innerHTML = '';
      this.mapElement.clear();
      this.mapSearch.map = this.mapElement.map;
      this.mapSearch.query = address || this.addresses[Math.floor(this.addresses.length * Math.random())];
      this.mapSearch.addEventListener('google-map-search-results', searchListener);
      this.mapSearch.search();
    }
  };
}());
